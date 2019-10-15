import { Store } from '../store/Store.js'

console.log('Background script started')

const store = new Store()

function initializeAuthListener (cookieStoreId, proxy) {
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

function openPreferences () {
  browser.runtime.openOptionsPage()
}

async function onRequest (requestDetails) {
  const cookieStoreId = requestDetails.cookieStoreId
  if (!cookieStoreId) {
    console.error('cookieStoreId is not defined', requestDetails)
    return []
  }

  const proxies = await store.getProxiesForContainer(cookieStoreId)

  if (proxies.length > 0) {
    proxies.forEach(p => {
      if (p.type === 'http' || p.type === 'https') {
        // TODO Use header for HTTPS proxies
        initializeAuthListener(cookieStoreId, p)
      }
    })

    return proxies/* .map(p => {
            return {type: p.type, host:p.host, port: p.port, username: p.username, password: p.password, proxyDNS: p.proxyDNS, failoverTimeout: Number.parseInt(p.failoverTimeout, 10)}
        }) */
  }

  return []
}

const filter = { urls: ['<all_urls>'] }

browser.proxy.onRequest.addListener(onRequest, filter)

browser.browserAction.onClicked.addListener(openPreferences)

browser.proxy.onError.addListener((e) => {
  console.error('Proxy error', e)
})
