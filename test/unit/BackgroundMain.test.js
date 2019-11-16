import BackgroundMain from '../../src/background/BackgroundMain'
import { Store } from '../../src/store/Store'
import webExtensionsApiFake from 'webextensions-api-fake'

const { expect } = require('chai')

describe('BackgroundMain', function () {
  beforeEach(() => {
    global.browser = webExtensionsApiFake()
  })

  afterEach(() => {
    delete global.browser
  })

  const backgroundMain = new BackgroundMain({ store: new Store() })

  describe('onRequest', function () {
    it('should return empty array if no proxy is set up', async () => {
      const result = await backgroundMain.onRequest({ cookieStoreId: 'firefox-default' })

      expect(result).to.be.an('array')
      expect(result).to.be.empty
    })
  })
})
