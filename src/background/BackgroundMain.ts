import {generateAuthorizationHeader} from '../options/util'
import {ProxyDao, Store} from '../store/Store'
import {ProxyInfo} from '../domain/ProxyInfo'
import BlockingResponse = browser.webRequest.BlockingResponse
import _OnAuthRequiredDetails = browser.webRequest._OnAuthRequiredDetails
import _OnRequestDetails = browser.proxy._OnRequestDetails

const localhosts = new Set(['localhost', '127.0.0.1', '[::1]'])

export const doNotProxy = []

export default class BackgroundMain {
  store: Store

  constructor({store}: { store: Store }) {
    this.store = store
  }

  initializeAuthListener(cookieStoreId: string, proxy: ProxyDao): void {
    const listener: (details: _OnAuthRequiredDetails) => BlockingResponse = (details) => {
      if (!details.isProxy) return {}

      if (details.cookieStoreId !== cookieStoreId) return {}

      // TODO: Fix in @types/firefox-webext-browser
      // @ts-expect-error
      const info = details.proxyInfo
      if (info.host !== proxy.host || info.port !== proxy.port || info.type !== proxy.type) return {}

      const result = {authCredentials: {username: proxy.username, password: proxy.password}}

      browser.webRequest.onAuthRequired.removeListener(listener)

      return result
    }

    browser.webRequest.onAuthRequired.addListener(
      listener,
      { urls: ['<all_urls>'] },
        ['blocking']
    )
  }

  openPreferences(browser: { runtime: any }) {
    return () => {
      browser.runtime.openOptionsPage()
    }
  }

  // TODO: Fix in @types/firefox-webext-browser
  async onRequest(requestDetails: _OnRequestDetails): Promise<any> {
    const cookieStoreId = requestDetails.cookieStoreId ?? ''
    if (cookieStoreId === '') {
      console.error('cookieStoreId is not defined', requestDetails)
      return doNotProxy
    }

    const proxies = await this.store.getProxiesForContainer(cookieStoreId)

    if (proxies.length > 0) {
      proxies.forEach(p => {
        if (p.type === 'http' || p.type === 'https') {
          this.initializeAuthListener(cookieStoreId, p)
        }
      })

      const result = proxies.map((p: ProxyDao) => {
        // @ts-expect-error
        if (p.type === 'https' && p.username as boolean && p.password as boolean) {
          const proxyAuthorizationHeader = generateAuthorizationHeader(p.username, p.password)
          return {proxyAuthorizationHeader, ...p}
        } else {
          return p
        }
      }).filter(p => {
        try {
          const documentUrl = new URL(requestDetails.url)
          const isLocalhost = localhosts.has(documentUrl.hostname)
          if (isLocalhost && p.doNotProxyLocal) {
            return false
          }
        } catch (e) {
          console.error(e)
        }

        return true
      }).map((p: any) => {
        delete p.doNotProxyLocal
        return p
      })

      if (result.length === 0) {
        return doNotProxy
      }
      return result
    }

    return doNotProxy
  }

  run(browser: { proxy: any, browserAction: any, runtime: any }): void {
    const filter = {urls: ['<all_urls>']}

    browser.proxy.onRequest.addListener(this.onRequest.bind(this), filter)

    browser.browserAction.onClicked.addListener(this.openPreferences(browser))

    browser.proxy.onError.addListener((e: Error) => {
      console.error('Proxy error', e)
    })
  }
}
