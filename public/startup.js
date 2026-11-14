(() => {
  function showLoadError() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', showLoadError, { once: true })
      return
    }
    if (document.getElementById('page-load-error')) return

    // Keep recovery outside the hydration root, even when the entry module never loads.
    const notice = document.createElement('section')
    notice.id = 'page-load-error'
    notice.setAttribute('role', 'alert')
    notice.style.cssText = 'position:fixed;inset:auto 16px 16px;z-index:1000;padding:20px;background:var(--md-sys-color-error-container, #93000a);color:var(--md-sys-color-on-error-container, #ffdad6);max-height:calc(100dvh - 32px);overflow:auto'
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

  // Resource errors do not bubble; capture also catches a failed static module import.
  window.addEventListener('error', event => {
    if (event.target?.tagName === 'SCRIPT' && event.target.src) showLoadError()
  }, true)
  // Do not suppress the rejection: the router must not mount a missing component.
  window.addEventListener('vite:preloadError', showLoadError)
  // Load waits for both scripts, covering an entry failure before this async script arrived.
  window.addEventListener('load', () => {
    if (!document.documentElement.hasAttribute('data-app-started')) showLoadError()
  }, { once: true })
})()
