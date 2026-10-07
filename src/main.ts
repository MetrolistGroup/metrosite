import { createSSRApp } from 'vue'
import App from './App.vue'
import { createAppRouter } from './router'

// Every route ships prerendered HTML; hydrate it once the route's chunk is loaded.
const router = createAppRouter()
const app = createSSRApp(App).use(router)
router.isReady().then(() => app.mount('#app'))
