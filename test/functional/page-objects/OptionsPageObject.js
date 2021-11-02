const PageObject = require('./PageObject.js')
const assert = require('assert')
const ProxyListPageObject = require('./ProxyListPageObject.js')
const AssignPageObject = require('./AssignPageObject.js')

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
  proxies = '[test-id=proxies]'
  assign = '[test-id=assign]'

  /**
   * @return {Promise<ProxyListPageObject>}
   */
  async openProxyList () {
    await this.click(this.proxies)
    await this._driver.sleep(1000) // TODO: Waiting for loading
    return this.createPageObject(ProxyListPageObject)
  }

  /**
   * @return {Promise<AssignPageObject>}
   */
  async openAssignProxy () {
    await this.click(this.assign)
    await this._driver.sleep(1000) // TODO: Waiting for loading
    return this.createPageObject(AssignPageObject)
  }
}

module.exports = OptionsPageObject
