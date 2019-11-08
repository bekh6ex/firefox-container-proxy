const PageObject = require('./PageObject.js')
const ProxyListPageObject = require('./ProxyListPageObject.js')

const { webdriver: { until, By } } = require('webextensions-geckodriver')

class OptionsPageObject extends PageObject {
  static async create (driver) {
    await driver.wait(async () => {
      const el = await driver.wait(until.elementLocated(
        OptionsPageObject.headerSelector
      ), 2000)

      const text = await el.getText()
      return text === 'Container proxy'
    }, 1000, 'Should have loaded options.html with header')

    return new OptionsPageObject(driver)
  }

  static get headerSelector () {
    return By.css('.header-text h1')
  }

  proxies = '.nav__item.proxies'

  /**
   * @return {Promise<ProxyListPageObject>}
   */
  async openProxyList () {
    await this.click(this.proxies)
    return ProxyListPageObject.create(this._driver)
  }
}

module.exports = OptionsPageObject
