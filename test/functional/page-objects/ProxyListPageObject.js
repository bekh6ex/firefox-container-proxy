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

  static addButtonSelector () {
    return By.css('.proxy-list-actions .button.button--primary')
  }

  constructor (driver) {
    super(driver)

    this.el = {
      add: ProxyListPageObject.addButtonSelector()
    }
  }

  async openAddProxyForm () {
    await (await this.waitForElement(this.el.add)).click()
    return ProxyFormPageObject.create(this.driver)
  }
}

module.exports = ProxyListPageObject
