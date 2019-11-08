const webExtensionsGeckoDriver = require('webextensions-geckodriver')
const { webdriver } = webExtensionsGeckoDriver
const { until, By } = webdriver

class PageObject {
  constructor (driver) {
    this._driver = driver
  }

  async waitFor (el, timeout = 100) {
    return this._driver.wait(until.elementLocated(this.selector(el)), timeout)
  }

  find (el) {
    return this._driver.findElement(this.selector(el))
  }

  selector (el) {
    if (typeof el === 'string') {
      el = By.css(el)
    }
    return el
  }

  async click (el) {
    const found = await this.waitFor(el)
    await found.click()
  }

  async pause (time) {
    return this._driver.wait(async () => {
      return false
    }, time, 'Pause and fail')
  }
}

module.exports = PageObject
