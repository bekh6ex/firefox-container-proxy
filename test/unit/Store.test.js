import { Store } from '../../src/store/Store.js'
import webExtensionsApiFake from 'webextensions-api-fake'

const { expect } = require('chai')

describe('Store', () => {
  beforeEach(() => {
    global.browser = webExtensionsApiFake()
  })

  afterEach(() => {
    delete global.browser
  })

  function someProxyWith (id) {
    return {
      id: id,
      title: 'some title',
      type: 'socks',
      host: 'localhost',
      port: 1080,
      username: 'user',
      password: 'password',
      proxyDNS: true,
      failoverTimeout: 5
    }
  }

  it('should put and get the proxy back', async () => {
    const store = new Store()

    const id = 'someId'
    const proxy = someProxyWith(id)

    await store.putProxy(proxy)

    const gotProxy = await store.getProxyById(id)

    expect(gotProxy).to.be.equal(proxy)
  })

  it('should be able to delete proxy', async () => {
    const store = new Store()
    const id = 'someId'
    await store.putProxy(someProxyWith(id))
    await store.deleteProxyById(id)

    const result = await store.getProxyById(id)

    expect(result).to.be.null
  })
})
