import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { PAGE_META, SITE_URL, type PageMeta } from './content/site'
import HomeView from './views/HomeView.vue'

const ROUTES = [
  { path: '/', name: 'home', component: HomeView, meta: PAGE_META.home },
  { path: '/listen', name: 'listen', component: () => import('./views/ListenPage.vue'), meta: PAGE_META.listen },
  { path: '/faq', name: 'faq', component: () => import('./views/FaqPage.vue'), meta: PAGE_META.faq },
  { path: '/privacy', name: 'privacy', component: () => import('./views/PrivacyPage.vue'), meta: PAGE_META.privacy },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundPage.vue'), meta: PAGE_META.notFound },
]

export function createAppRouter() {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) return savedPosition
      if (to.hash) return { el: to.hash, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }
      return { top: 0 }
    },
    routes: ROUTES,
  })

  // The build prerenders head tags per route; this keeps them right during client navigation.
  if (!import.meta.env.SSR) router.afterEach((to) => {
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
