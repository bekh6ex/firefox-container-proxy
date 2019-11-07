const PageObject = require('./PageObject.js')

const webExtensionsGeckoDriver = require('webextensions-geckodriver')
const { webdriver } = webExtensionsGeckoDriver
const { until, By } = webdriver

class OptionsPageObject extends PageObject {
  static async create (driver) {
    await driver.wait(async () => {
      const header = await driver.wait(until.elementLocated(
        OptionsPageObject.headerSelector
      ), 2000)

      const text = await header.getText()
      return text === 'Container proxy'
    }, 1000, 'Should have loaded options.html with header')

    return new OptionsPageObject(driver)
  }

  static get headerSelector () {
    return By.css('.header-text h1')
  }

  constructor (driver) {
    super(driver)
    this.el = {
      header: OptionsPageObject.headerSelector,
      nav: {
        proxies: By.css('.nav__item.proxies')
      }
    }
  }

  async openProxyList () {
    const proxies = await this.waitForElement(this.el.nav.proxies)
    return proxies.click()
  }
}

module.exports = OptionsPageObject
