// Bun-only, non-browser self-check: exercise routing/startup with inert components and host stubs.
import assert from 'node:assert/strict'
import { runInNewContext } from 'node:vm'
import { mock } from 'bun:test'
import * as vueRouter from 'vue-router'

Bun.plugin({
  name: 'inert-route-components',
  setup(build) {
    build.onLoad({ filter: /\.vue$/ }, () => ({ contents: 'export default {}', loader: 'js' }))
  },
})
// Keep the real router/guards, without browser history or rendering.
mock.module('vue-router', () => ({ ...vueRouter, createWebHistory: vueRouter.createMemoryHistory }))
delete process.env.SSR

const assigned = []
const events = new Map()
const listenerOptions = new Map()
const documentEvents = new Map()
const nodes = new Map()
let reducedMotion = false
let reloads = 0
let focusCalls = 0
const element = () => ({
  tabIndex: -1,
  attributes: new Map(),
  events: new Map(),
  children: [],
  style: {},
  hasAttribute(name) { return this.attributes.has(name) },
  setAttribute(name, value) { this.attributes.set(name, value) },
  removeAttribute(name) { this.attributes.delete(name) },
  addEventListener(name, callback) { this.events.set(name, callback) },
  append(...children) { this.children.push(...children); for (const child of children) if (child.id) nodes.set(child.id, child) },
  focus(options) { assert.deepEqual(options, { preventScroll: true }); focusCalls++ },
})
const head = element()
const meta = new Map()
globalThis.document = {
  title: '',
  head,
  body: element(),
  documentElement: element(),
  addEventListener: (name, callback, options) => documentEvents.set(name, { callback, options }),
  getElementById: id => nodes.get(id) ?? null,
  querySelector(selector) {
    if (!meta.has(selector)) meta.set(selector, { setAttribute: (name, value) => meta.set(`${selector}:${name}`, value) })
    return meta.get(selector)
  },
  createElement: element,
}
globalThis.window = {
  location: { href: 'https://metrolist.cc/listen?code=invite%2B123#room', assign: url => assigned.push(url), reload: () => reloads++ },
  matchMedia: () => ({ matches: reducedMotion }),
  addEventListener(name, callback, options) { events.set(name, callback); listenerOptions.set(name, options) },
}

// Execute the actual classic bootstrap before importing any application modules.
const bootstrap = await Bun.file(new URL('../public/startup.js', import.meta.url)).text()
runInNewContext(bootstrap, { window, document })
const resourceError = events.get('error')
assert.equal(listenerOptions.get('error'), true, 'script resource errors require capture')
resourceError({ target: { tagName: 'IMG', src: '/missing.webp' } })
resourceError({ target: window, message: 'unrelated runtime error' })
assert.equal(document.body.children.length, 0, 'ignore non-script errors')
const body = document.body
document.body = null
const failedEntry = { target: { tagName: 'SCRIPT', src: '/assets/index-missing.js' } }
resourceError(failedEntry)
resourceError(failedEntry)
assert.equal(body.children.length, 0, 'wait for the body when an early script fails')
assert.equal(documentEvents.get('DOMContentLoaded').options.once, true)
document.body = body
documentEvents.get('DOMContentLoaded').callback()
resourceError(failedEntry)
assert.equal(body.children.length, 1, 'early entry failure needs only one notice without main.ts')
assert.equal(body.children[0].attributes.get('role'), 'alert')
assert.equal(reloads, 0, 'early failure must not reload automatically')
body.children[0].children[1].events.get('click')()
assert.equal(reloads, 1, 'early recovery must offer manual reload without main.ts')
assert.equal(window.location.href, 'https://metrolist.cc/listen?code=invite%2B123#room')
body.children.length = 0
nodes.delete('page-load-error')
reloads = 0
// A late async bootstrap also recovers an entry error it never observed.
events.get('load')()
assert.equal(body.children.length, 1, 'missing entry must recover even if its resource error was missed')
assert.equal(reloads, 0)
// Clear only the notice so the real main.ts rejection must show it again.
body.children.length = 0
nodes.delete('page-load-error')

const { createAppRouter } = await import('../src/router.ts')
const router = createAppRouter()
for (const path of ['/FAQ', '/Privacy', '/LISTEN', '/WATCH', '/PARTY', '/CHANNEL/UC123']) assert.equal(router.resolve(path).name, 'not-found')
for (const path of ['/faq', '/privacy', '/listen', '/party']) assert.equal(router.resolve(path).name, path.slice(1))
for (const path of ['/watch?v=123456789', '/playlist?list=PL123', '/browse/MPREb_123', '/channel/UC123', '/album/MPREb_123', '/artist/UC123', '/open?url=https%3A%2F%2Fmusic.youtube.com%2Fwatch%3Fv%3D123456789']) {
  const resolved = router.resolve(path)
  assert.equal(resolved.name, `share-${path.split(/[/?]/)[1]}`)
  assert.equal(resolved.meta.robots, 'noindex, follow')
}
assert.equal(router.resolve('/party?r=listentogetherid').query.r, 'listentogetherid')
assert.equal(router.resolve('/listen?code=listentogetherid').query.code, 'listentogetherid')

await router.push('/privacy?source=initial')
assert.deepEqual(assigned, [], 'START navigation must stay in the app')
const title = document.title
const metadata = [...meta.entries()]
for (const destination of ['/faq?source=nav#question', '/missing', '/#features']) {
  const failure = await router.push(destination)
  assert(vueRouter.isNavigationFailure(failure, vueRouter.NavigationFailureType.aborted))
  assert.equal(assigned.at(-1), destination)
  assert.equal(router.currentRoute.value.path, '/privacy')
  assert.equal(document.title, title)
  assert.deepEqual([...meta.entries()], metadata, 'failed navigation must not write head tags')
}
const assignedCount = assigned.length
await router.push('/privacy?source=changed#data')
assert.equal(assigned.length, assignedCount, 'same-path query/hash changes stay in the app')

const target = element()
nodes.set('data', target)
const scroll = router.options.scrollBehavior
const to = router.resolve('/privacy#data')
const from = router.resolve('/privacy')
const saved = { top: 217, left: 0 }
assert.equal(scroll(to, from, saved), saved)
assert.equal(focusCalls, 0)
assert.deepEqual(scroll(to, vueRouter.START_LOCATION, null), { el: target, top: 96, behavior: 'smooth' })
assert.equal(focusCalls, 0, 'initial hash must not steal focus')
scroll(router.resolve('/privacy?query=changed#data'), to, null)
assert.equal(focusCalls, 0, 'query-only changes must not steal focus')
reducedMotion = true
assert.deepEqual(scroll(to, from, null), { el: target, top: 96, behavior: 'auto' })
assert.equal(focusCalls, 1)
assert.equal(target.attributes.get('tabindex'), '-1')
target.events.get('blur')()
assert.equal(target.hasAttribute('tabindex'), false)
target.setAttribute('tabindex', '0')
scroll(to, from, null)
assert.equal(target.attributes.get('tabindex'), '0', 'preserve author-provided tabindex')
assert.equal(scroll(router.resolve('/privacy#missing'), from, null), false)
assert.deepEqual(scroll(from, to, null), { top: 0 })

// The shared server router must work without any browser globals.
const clientWindow = window
const clientDocument = document
delete globalThis.window
delete globalThis.document
process.env.SSR = 'true'
const serverRouter = createAppRouter()
await serverRouter.push('/FAQ')
assert.equal(serverRouter.currentRoute.value.name, 'not-found')
await serverRouter.push('/faq')
assert.equal(serverRouter.currentRoute.value.name, 'faq')
for (const [path, name] of [['/party?r=listentogetherid', 'party'], ['/watch?v=123456789', 'share-watch'], ['/browse/MPREb_123', 'share-browse'], ['/channel/UC123', 'share-channel']]) {
  await serverRouter.push(path)
  assert.equal(serverRouter.currentRoute.value.name, name)
}
await serverRouter.isReady()
delete process.env.SSR
globalThis.window = clientWindow
globalThis.document = clientDocument

// A failed bootstrap request must not disable the real main.ts recovery handlers.
events.clear()
const ready = Promise.withResolvers()
let onError
let mounts = 0
mock.module('../src/router.ts', () => ({ createAppRouter: () => ({
  onError: callback => { onError = callback },
  isReady: () => ready.promise,
}) }))
const app = { use: () => app, mount: () => mounts++ }
mock.module('vue', () => ({ createSSRApp: () => app }))
await import('../src/main.ts')
assert(document.documentElement.hasAttribute('data-app-started'), 'main starts without waiting for bootstrap')
ready.reject(new Error('missing initial chunk'))
await new Promise(resolve => setTimeout(resolve, 0))
assert.equal(mounts, 0)
assert.equal(document.body.children.length, 1)
assert.equal(reloads, 0, 'failure must never reload automatically')
const preload = events.get('vite:preloadError')
assert.equal(typeof preload, 'function')
preload({ preventDefault() { assert.fail('preload rejection must reach the router') } })
onError(new Error('same chunk failure'))
assert.equal(document.body.children.length, 1, 'report overlapping failures only once')
const retry = document.body.children[0].children[1]
retry.events.get('click')()
assert.equal(reloads, 1)
assert.equal(window.location.href, 'https://metrolist.cc/listen?code=invite%2B123#room')
assert.equal(assigned.length, assignedCount, 'reload must preserve the requested URL')

body.children.length = 0
nodes.delete('page-load-error')
onError(new Error('lazy route failed without bootstrap'))
assert.equal(body.children.length, 1, 'router failures recover even without startup.js')
assert.equal(body.children[0].attributes.get('role'), 'alert')
body.children.length = 0
nodes.delete('page-load-error')
preload({ preventDefault() { assert.fail('preload rejection must reach the router') } })
assert.equal(body.children.length, 1, 'preload failures recover even without startup.js')

// With both recovery paths available, overlapping failures still create only one notice.
runInNewContext(bootstrap, { window, document })
events.get('error')(failedEntry)
events.get('vite:preloadError')({})
onError(new Error('overlapping failure'))
assert.equal(body.children.length, 1)
assert.equal(reloads, 1, 'overlapping failures must not reload automatically')
body.children.length = 0
nodes.delete('page-load-error')
events.get('load')()
assert.equal(body.children.length, 0, 'a late bootstrap must not flag an entry that already started')

console.log('Navigation self-check passed: case sensitivity, document redirects, failure metadata, hash scroll/focus, early entry, startup/preload recovery, failed-bootstrap fallback, late async bootstrap.')
