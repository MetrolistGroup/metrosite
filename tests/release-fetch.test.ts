import { afterEach, beforeEach, expect, jest, mock, spyOn, test } from 'bun:test'

let getLatestRelease: typeof import('../src/content/downloads').getLatestRelease
let moduleId = 0

beforeEach(async () => {
  jest.useFakeTimers()
  // Isolate the module's private cache without adding a production reset API.
  getLatestRelease = (await import(`../src/content/downloads.ts?release-test=${++moduleId}`)).getLatestRelease
})

afterEach(() => {
  mock.restore()
  jest.useRealTimers()
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}

test('shares in-flight requests and caches success for 60 seconds after completion', async () => {
  const response = deferred<Response>()
  const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(() => response.promise)
  const first = getLatestRelease()
  expect(getLatestRelease()).toBe(first)
  expect(fetchMock).toHaveBeenCalledTimes(1)

  jest.advanceTimersByTime(9_000)
  response.resolve(Response.json({ tag_name: 'v1', assets: [] }))
  expect(await first).toEqual({ tag_name: 'v1', assets: [] })
  expect(jest.getTimerCount()).toBe(0)
  jest.advanceTimersByTime(59_999)
  expect(getLatestRelease()).toBe(first)

  const updated = { tag_name: 'v2', assets: [{ name: 'Metrolist.apk', browser_download_url: 'new-apk' }] }
  fetchMock.mockResolvedValue(Response.json(updated))
  jest.advanceTimersByTime(1)
  const refreshed = getLatestRelease()
  expect(refreshed).not.toBe(first)
  expect(getLatestRelease()).toBe(refreshed)
  expect(await refreshed).toEqual(updated)
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

for (const failure of ['HTTP 429', 'timeout']) {
  test(`keeps the last successful release after a refresh ${failure} and retries`, async () => {
    const previous = { tag_name: 'v1', assets: [{ name: 'Metrolist.apk', browser_download_url: 'v1-apk' }] }
    const fetchMock = spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(previous))
    const cached = await getLatestRelease()
    jest.advanceTimersByTime(60_000)

    if (failure === 'timeout') {
      fetchMock.mockImplementation(() => new Promise<Response>(() => {}))
    } else {
      fetchMock.mockResolvedValue(new Response(null, { status: 429 }))
    }
    const refresh = getLatestRelease()
    expect(getLatestRelease()).toBe(refresh)
    if (failure === 'timeout') jest.advanceTimersByTime(10_000)
    expect(await refresh).toBe(cached)
    expect((await refresh).assets).toEqual(previous.assets)
    expect(jest.getTimerCount()).toBe(0)

    // Falling back must not make the stale result fresh or discard it on repeated errors.
    fetchMock.mockResolvedValue(new Response(null, { status: 429 }))
    expect(await getLatestRelease()).toBe(cached)
    expect(fetchMock).toHaveBeenCalledTimes(3)

    const updated = { tag_name: 'v2', assets: [{ name: 'Metrolist.apk', browser_download_url: 'v2-apk' }] }
    fetchMock.mockResolvedValue(Response.json(updated))
    const recovered = getLatestRelease()
    expect(await recovered).toEqual(updated)
    expect(getLatestRelease()).toBe(recovered)
    expect(fetchMock).toHaveBeenCalledTimes(4)

    jest.advanceTimersByTime(60_000)
    fetchMock.mockResolvedValue(new Response(null, { status: 429 }))
    expect(await getLatestRelease()).toEqual(updated)
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })
}

for (const status of [403, 404, 429, 500]) {
  test(`rejects HTTP ${status} and retries on the next call`, async () => {
    const fetchMock = spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status }))
    await expect(getLatestRelease()).rejects.toThrow(`GitHub returned ${status}`)
    expect(jest.getTimerCount()).toBe(0)
    fetchMock.mockResolvedValue(Response.json({ tag_name: 'retry' }))
    expect(await getLatestRelease()).toEqual({ tag_name: 'retry' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
}

test('shares network rejection and retries', async () => {
  const fetchMock = spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
  const first = getLatestRelease()
  expect(getLatestRelease()).toBe(first)
  await expect(first).rejects.toThrow('offline')
  expect(jest.getTimerCount()).toBe(0)
  fetchMock.mockResolvedValue(Response.json({ assets: [] }))
  expect(await getLatestRelease()).toEqual({ assets: [] })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

test('rejects invalid JSON and retries', async () => {
  const fetchMock = spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{'))
  await expect(getLatestRelease()).rejects.toBeInstanceOf(SyntaxError)
  expect(jest.getTimerCount()).toBe(0)
  fetchMock.mockResolvedValue(Response.json({ tag_name: 'retry' }))
  expect(await getLatestRelease()).toEqual({ tag_name: 'retry' })
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

for (const stage of ['fetch', 'body']) {
  test(`aborts a stalled ${stage} at 10 seconds and retries without late cache writes`, async () => {
    const headers = deferred<Response>()
    const body = deferred<unknown>()
    const bodyStarted = deferred<void>()
    let signal: AbortSignal | null | undefined
    const fetchMock = spyOn(globalThis, 'fetch').mockImplementation(async (_, options) => {
      signal = options?.signal
      if (stage === 'fetch') return headers.promise
      const response = new Response()
      response.json = () => {
        bodyStarted.resolve()
        return body.promise
      }
      return response
    })
    const first = getLatestRelease()
    const rejection = first.catch(error => error)
    if (stage === 'body') await bodyStarted.promise
    expect(getLatestRelease()).toBe(first)
    jest.advanceTimersByTime(9_999)
    expect(signal?.aborted).toBe(false)
    expect(getLatestRelease()).toBe(first)
    jest.advanceTimersByTime(1)
    expect((await rejection).message).toBe('GitHub release request timed out')
    expect(signal?.aborted).toBe(true)
    expect(jest.getTimerCount()).toBe(0)

    fetchMock.mockResolvedValue(Response.json({ tag_name: 'retry' }))
    const retry = getLatestRelease()
    expect(await retry).toEqual({ tag_name: 'retry' })
    // These mocks deliberately ignore abort, so late completion must not alter the cache.
    headers.resolve(Response.json({ tag_name: 'stale' }))
    body.resolve({ tag_name: 'stale' })
    await headers.promise
    await body.promise
    expect(getLatestRelease()).toBe(retry)
    expect(await getLatestRelease()).toEqual({ tag_name: 'retry' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
}
