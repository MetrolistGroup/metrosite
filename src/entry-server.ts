import { createSSRApp } from 'vue'
import { renderToString, type SSRContext } from 'vue/server-renderer'
import App from './App.vue'
import { createAppRouter } from './router'

export async function render(url: string) {
  const router = createAppRouter()
  const app = createSSRApp(App).use(router)
  await router.push(url)
  await router.isReady()
  const context: SSRContext = {}
  const html = await renderToString(app, context)
  return { html, modules: (context.modules ?? new Set()) as Set<string>, teleports: (context.teleports ?? {}) as Record<string, string> }
}
