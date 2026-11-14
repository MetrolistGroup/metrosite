import { SITE_URL } from './site'

export const SHARE_ID_PATHS = ['/browse', '/channel', '/album', '/artist'] as const
export const SHARE_PATHS = ['/watch', '/playlist', ...SHARE_ID_PATHS, '/open'] as const

type MusicShare = {
  kind: 'song' | 'playlist' | 'album' | 'artist'
  id: string
  youtubeUrl: string
}

export function musicShareFromUrl(value: string, depth = 0): MusicShare | null {
  if (value.length > 4096 || depth > 3) return null
  let url: URL
  try {
    url = new URL(value, SITE_URL)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase()
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
  const metrolist = host === 'metrolist.cc' || host.endsWith('.metrolist.cc') || host === 'localhost' || host === '127.0.0.1'
  if (!metrolist && !['music.youtube.com', 'youtube.com', 'www.youtube.com', 'youtu.be'].includes(host)) return null

  const singleParam = (name: string) => url.searchParams.getAll(name).length === 1 ? url.searchParams.get(name) : null
  if (metrolist && url.pathname === '/open') {
    const target = singleParam('url')
    return target ? musicShareFromUrl(target, depth + 1) : null
  }

  const path = url.pathname.replace(/\/$/, '')
  let kind: MusicShare['kind']
  let id: string | null
  if (host === 'youtu.be') {
    kind = 'song'
    id = path.slice(1)
  } else if (path === '/watch') {
    kind = 'song'
    id = singleParam('v')
  } else if (path === '/playlist') {
    kind = 'playlist'
    id = singleParam('list')
  } else {
    const match = /^\/(browse|album|channel|artist)\/([^/]+)$/.exec(path)
    if (!match) return null
    kind = match[1] === 'browse' || match[1] === 'album' ? 'album' : 'artist'
    id = match[2]!
  }
  if (!id || !/^[A-Za-z0-9_-]{1,256}$/.test(id)) return null

  const target = kind === 'song' ? `/watch?v=${id}` : kind === 'playlist' ? `/playlist?list=${id}` : kind === 'album' ? `/browse/${id}` : `/channel/${id}`
  return { kind, id, youtubeUrl: `https://music.youtube.com${target}` }
}

export function musicAppUrl(share: MusicShare, userAgent: string, maxTouchPoints: number): string {
  if (share.kind === 'song') return `metrolist://watch?v=${share.id}`
  if (share.kind === 'playlist') {
    // MobileRoutes uses a path ID on iOS; Android and desktop parse YouTube's list parameter.
    const ios = /iphone|ipad|ipod/i.test(userAgent) || (/macintosh/i.test(userAgent) && maxTouchPoints > 1)
    return ios ? `metrolist://playlist/${share.id}` : `metrolist://playlist?list=${share.id}`
  }
  return `metrolist://${share.kind}/${share.id}`
}
