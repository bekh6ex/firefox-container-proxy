const webExtensionsGeckoDriver = require('webextensions-geckodriver')
const { webdriver } = webExtensionsGeckoDriver
const { until } = webdriver

class PageObject {
  constructor (driver) {
    this.driver = driver
  }

  async waitForElement (el) {
    if (typeof el === 'string') {
      el = By.css(el)
    }
    await this.driver.wait(until.elementLocated(el), 100)
    return this.driver.findElement(el)
  }

  async pause (time) {
    return this.driver.wait(async () => {
      return false
    }, time, 'Pause and fail')
  }
}

module.exports = PageObject
