import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ListenPage from './views/ListenPage.vue'
import FaqPage from './views/FaqPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Metrolist · Music for every screen', description: 'An ad-free, open-source YouTube Music client for Android, iOS, Linux, macOS, and Windows. Explore adaptive layouts, offline playback, lyrics, and more.' } },
    { path: '/listen', name: 'listen', component: ListenPage, meta: { title: 'Listen Together · Metrolist', description: 'Join a Metrolist listening room and share the soundtrack with friends.' } },
    { path: '/faq', name: 'faq', component: FaqPage, meta: { title: 'Frequently asked questions · Metrolist', description: 'Answers about Metrolist platforms, installation, accounts, migration, updates, and open-source music playback.' } },
  ],
})

router.afterEach((to) => {
  const title = to.meta.title as string
  const description = to.meta.description as string
  const url = `https://metrolist.meowery.eu${to.path === '/' ? '/' : to.path}`
  document.title = title
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    document.querySelector(selector)?.setAttribute('content', description)
  }
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
    document.querySelector(selector)?.setAttribute('content', title)
  }
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
  document.querySelector('meta[name="robots"]')?.setAttribute('content', to.name === 'listen' ? 'noindex, follow' : 'index, follow')
})
