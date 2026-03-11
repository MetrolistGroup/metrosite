import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import ListenPage from './views/ListenPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/listen', name: 'listen', component: ListenPage },
  ],
})
