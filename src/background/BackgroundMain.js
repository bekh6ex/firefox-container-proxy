export default class BackgroundMain {
  constructor ({ store }) {
    this.store = store
  }

  initializeAuthListener (cookieStoreId, proxy) {
    const listener = (details) => {
      if (!details.isProxy) return {}

      if (details.cookieStoreId !== cookieStoreId) return {}

      const info = details.proxyInfo
      if (info.host !== proxy.host || info.port !== proxy.port || info.type !== proxy.type) return {}

      const result = { authCredentials: { username: proxy.username, password: proxy.password } }

      browser.webRequest.onAuthRequired.removeListener(listener)

      return result
    }

    browser.webRequest.onAuthRequired.addListener(
      listener,
      { urls: ['<all_urls>'] },
      ['blocking']
    )
  }

  openPreferences (browser) {
    return () => {
      browser.runtime.openOptionsPage()
    }
  }

  async onRequest (requestDetails) {
    const cookieStoreId = requestDetails.cookieStoreId
    if (!cookieStoreId) {
      console.error('cookieStoreId is not defined', requestDetails)
      return []
    }

    const proxies = await this.store.getProxiesForContainer(cookieStoreId)

    if (proxies.length > 0) {
      proxies.forEach(p => {
        if (p.type === 'http' || p.type === 'https') {
          // TODO Use header for HTTPS proxies
          this.initializeAuthListener(cookieStoreId, p)
        }
      })

      return proxies
    }

    return []
  }

  run (browser) {
    const filter = { urls: ['<all_urls>'] }

    browser.proxy.onRequest.addListener(this.onRequest.bind(this), filter)

    browser.browserAction.onClicked.addListener(this.openPreferences(browser))

    browser.proxy.onError.addListener((e) => {
      console.error('Proxy error', e)
    })
  }
}
