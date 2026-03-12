import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ListenPage from './views/ListenPage.vue'
import FaqPage from './views/FaqPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/listen', name: 'listen', component: ListenPage },
    { path: '/faq', name: 'faq', component: FaqPage },
  ],
})
