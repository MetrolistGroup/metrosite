import { createSSRApp } from 'vue'
import App from './App.vue'
import { createAppRouter } from './router'

// Keep an independent fallback if startup.js fails; the shared ID prevents duplicate notices.
function showLoadError() {
  if (document.getElementById('page-load-error')) return

  const notice = document.createElement('section')
  notice.id = 'page-load-error'
  notice.setAttribute('role', 'alert')
  notice.style.cssText = 'position:fixed;inset:auto 16px 16px;z-index:1000;padding:20px;background:#29262b;color:#ebe4eb;max-height:calc(100dvh - 32px);overflow:auto'
  const message = document.createElement('p')
  message.textContent = 'This page could not finish loading. Check your connection, then reload to try again.'
  const retry = document.createElement('button')
  retry.type = 'button'
  retry.className = 'btn btn-filled'
  retry.textContent = 'Reload page'
  retry.addEventListener('click', () => window.location.reload())
  notice.append(message, retry)
  document.body.append(notice)
}

if (!import.meta.env.SSR) {
  document.documentElement.setAttribute('data-app-started', '')
  window.addEventListener('vite:preloadError', showLoadError)

  // Every route ships prerendered HTML; hydrate it once the route's chunk is loaded.
  const router = createAppRouter()
  router.onError(showLoadError)
  const app = createSSRApp(App).use(router)
  router.isReady().then(() => app.mount('#app')).catch(showLoadError)
}
