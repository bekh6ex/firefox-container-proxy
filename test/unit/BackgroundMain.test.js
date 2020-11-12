import BackgroundMain, { doNotProxy } from '../../src/background/BackgroundMain'
import { Store } from '../../src/store/Store'
import webExtensionsApiFake from 'webextensions-api-fake'

const { expect } = require('chai')

const store = new Store()

describe('BackgroundMain', function () {
  beforeEach(() => {
    global.browser = webExtensionsApiFake()
  })

  afterEach(() => {
    delete global.browser
  })

  const backgroundMain = new BackgroundMain({ store: store })

  describe('onRequest', function () {
    it('should return empty array if no proxy is set up', async () => {
      const result = await backgroundMain.onRequest({ cookieStoreId: 'firefox-default', url: 'https://google.com' })

      expect(result).to.be.deep.equal(doNotProxy)
    })

    it('should return proxy if proxy is set up', async () => {
      await givenSomeProxyIsSetUpForContainer({ containerId: 'firefox-default' })

      const result = await backgroundMain.onRequest({ cookieStoreId: 'firefox-default', url: 'https://google.com' })

      expect(result).to.be.an('array')
      expect(result).to.be.not.empty
    })

    it('should return proxy for the container if url is invalid', async () => {
      // To be more on a safe side
      await givenSomeProxyIsSetUpForContainer({ containerId: 'firefox-default' })

      const result = await backgroundMain.onRequest({ cookieStoreId: 'firefox-default', url: 'np-protocol-url.com' })

      expect(result).to.be.an('array')
      expect(result).to.be.not.empty
    })

    // Connections to localhost, 127.0.0.1, and ::1 are never proxied. (From FF settings)
    const localAddresses = [
      'http://localhost/index.html',
      'https://localhost/index.html',
      'http://127.0.0.1/',
      'https://127.0.0.1/',
      'http://[::1]/test',
      'https://[::1]/test',
      'http://[0:0:0:0:0:0:0:1]/test',
      'https://[0:0:0:0:0:0:0:1]/test',
      'https://user:password@127.0.0.1:123/',
      'http://[::1]:123/test'
    ]

    describe('proxying of local addresses is disabled', () => {
      localAddresses.forEach(url => {
        it(`should return empty array if the address is local: ${url}`, async () => {
          await givenSomeProxyIsSetUpForContainer({ containerId: 'container1', doNotProxyLocal: true })

          const result = await backgroundMain.onRequest({ cookieStoreId: 'container1', url })

          expect(result).to.be.deep.equal(doNotProxy)
        })
      })
    })

    describe('proxying of local addresses is enabled', () => {
      localAddresses.forEach(url => {
        it(`should return array with proxy: ${url}`, async () => {
          const host = 'proxyX.example.com'
          await givenSomeProxyIsSetUpForContainer({ host, containerId: 'container1', doNotProxyLocal: false })

          const result = await backgroundMain.onRequest({ cookieStoreId: 'container1', url })

          expect(result[0].host).to.be.equal(host)
        })
      })
    })
  })
})

async function givenSomeProxyIsSetUpForContainer ({ host, containerId, doNotProxyLocal }) {
  const proxyId = 'proxy1'
  const proxy = {
    id: proxyId,
    type: 'socks',
    host: host || 'example.com',
    port: 1080
  }
  if (typeof doNotProxyLocal !== 'undefined') {
    proxy.doNotProxyLocal = doNotProxyLocal
  }
  await store.putProxy(proxy)

  await store.setContainerProxyRelation(containerId, proxyId)
}
