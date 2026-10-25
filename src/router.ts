import { createMemoryHistory, createRouter, createWebHistory, START_LOCATION } from 'vue-router'
import { GUIDES, GUIDE_INDEX_META } from './content/guides'
import { PAGE_META, SITE_URL, type PageMeta } from './content/site'
import HomeView from './views/HomeView.vue'

const ROUTES = [
  { path: '/', name: 'home', component: HomeView, meta: PAGE_META.home },
  { path: '/listen', name: 'listen', component: () => import('./views/ListenPage.vue'), meta: PAGE_META.listen },
  { path: '/faq', name: 'faq', component: () => import('./views/FaqPage.vue'), meta: PAGE_META.faq },
  { path: '/privacy', name: 'privacy', component: () => import('./views/PrivacyPage.vue'), meta: PAGE_META.privacy },
  ...GUIDES.map(guide => ({
    path: `/guides/${guide.slug}`,
    name: `guide-${guide.slug}`,
    component: () => import('./views/GuidesPage.vue'),
    props: { slug: guide.slug },
    meta: guide.meta,
  })),
  { path: '/guides', name: 'guides', component: () => import('./views/GuidesPage.vue'), meta: GUIDE_INDEX_META },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundPage.vue'), meta: PAGE_META.notFound },
]

export function createAppRouter() {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    sensitive: true,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition
      if (to.hash) {
        const target = document.getElementById(to.hash.slice(1))
        if (!target) return false
        if (from !== START_LOCATION && to.path === from.path && to.hash !== from.hash) {
          if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1')
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
          }
          target.focus({ preventScroll: true })
        }
        return { el: target, top: 96, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }
      }
      return { top: 0 }
    },
    routes: ROUTES,
  })

  // Each document owns its prerendered structured data, Markdown and embed links.
  if (!import.meta.env.SSR) router.beforeEach((to, from) => {
    if (from !== START_LOCATION && to.path !== from.path) {
      window.location.assign(to.fullPath)
      return false
    }
  })

  if (!import.meta.env.SSR) router.afterEach((to, _from, failure) => {
    if (failure) return
    const meta = to.meta as unknown as PageMeta
    const url = `${SITE_URL}${to.path === '/' ? '/' : to.path}`
    document.title = meta.title

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (to.name === 'not-found') {
      canonical?.remove()
    } else {
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.append(canonical)
      }
      canonical.href = url
    }

    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      document.querySelector(selector)?.setAttribute('content', meta.description)
    }
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      document.querySelector(selector)?.setAttribute('content', meta.title)
    }
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
    document.querySelector('meta[name="robots"]')?.setAttribute('content', meta.robots)
  })

  return router
}
