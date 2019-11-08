const PageObject = require('./PageObject.js')
const ProxyFormPageObject = require('./ProxyFormPageObject.js')
const { webdriver: { until, By } } = require('webextensions-geckodriver')

class ProxyListPageObject extends PageObject {
  /**
   * @param driver
   * @return {Promise<ProxyListPageObject>}
   */
  static async create (driver) {
    await driver.wait(async () => {
      const el = await driver.wait(until.elementLocated(
        ProxyListPageObject.addButtonSelector()
      ), 2000)

      const text = await el.getText()
      return text === '+'
    }, 1000, 'Should have opened ProxyList')

    return new ProxyListPageObject(driver)
  }

  addButton = ProxyListPageObject.addButtonSelector()

  static addButtonSelector () {
    return By.css('.proxy-list-actions .button.button--primary')
  }

  async openAddProxyForm () {
    await this.click(this.addButton)
    return ProxyFormPageObject.create(this._driver)
  }
}

module.exports = ProxyListPageObject
