const PageObject = require('./PageObject.js')
const assert = require('assert')
const ProxyListPageObject = require('./ProxyListPageObject.js')

const { webdriver: { until } } = require('webextensions-geckodriver')

class OptionsPageObject extends PageObject {
  get stableSelector () {
    return async () => {
      const el = await this._driver.wait(until.elementLocated(
        this.selector(this.header)
      ), 2000)

      const text = await el.getText()
      assert.strictEqual(text, 'Container proxy')
      return el
    }
  }

  header = '.header-text h1'
  proxies = '.nav__item.proxies'

  /**
   * @return {Promise<ProxyListPageObject>}
   */
  async openProxyList () {
    await this.click(this.proxies)
    return this.createPageObject(ProxyListPageObject)
  }
}

module.exports = OptionsPageObject
