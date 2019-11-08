const PageObject = require('./PageObject.js')
const { webdriver: { until, By } } = require('webextensions-geckodriver')
const assert = require('assert')

class ProxyFormPageObject extends PageObject {
  /**
   * @param driver
   * @return {Promise<ProxyFormPageObject>}
   */
  static async create (driver) {
    await driver.wait(async () => {
      const el = await driver.wait(until.elementLocated(
        ProxyFormPageObject.saveButtonSelector()
      ), 2000)

      return !!el
    }, 1000, 'Should have opened ProxyForm')

    return new ProxyFormPageObject(driver)
  }

  static saveButtonSelector () {
    return By.css('button[data-testid=save]')
  }

  protocol = '.ProxyForm__connectionSettings select'
  server = '.ProxyForm__hostInput input'
  port = '.ProxyForm__portInput input'
  username = '.ProxyForm__credentials .input:first-of-type input'
  password = '.ProxyForm__credentials .input:last-of-type input'
  testSettingsButton = 'button[data-testid=testSettings]'
  saveButton = ProxyFormPageObject.saveButtonSelector()
  directTestResult = '[data-testid=directResult]'
  proxiedTestResult = '[data-testid=proxiedResult]'

  async selectProtocol (value) {
    const select = await this.waitFor(this.protocol)
    return select.findElement(By.css(`option[value="${value}"]`)).click()
  }

  async typeInServer (value) {
    return this.find(this.server).sendKeys(value)
  }

  async typeInPort (value) {
    return this.find(this.port).sendKeys(value)
  }

  async typeInUsername (value) {
    return this.find(this.username).sendKeys(value)
  }

  async typeInPassword (value) {
    const input = this.find(this.password)

    return input.sendKeys(value)
  }

  async testSettings () {
    await this.click(this.testSettingsButton)

    await this.confirmPrompt()

    const directTestResult = await this.waitFor(this.directTestResult, 11000)
    const directText = await directTestResult.getText()

    const testResultPattern = /^Your IP address is/
    assert.strictEqual(testResultPattern.test(directText), true)

    const proxiedTestResult = this.find(this.proxiedTestResult)

    const proxiedText = await proxiedTestResult.getText()

    assert.strictEqual(proxiedText, directText)
  }

  async confirmPrompt () {
    await this._driver.wait(until.alertIsPresent(), 500)
    const confirm = await this._driver.switchTo().alert()
    await confirm.accept()
  }

  /**
   * @return {Promise<ProxyListPageObject>}
   */
  async saveSettings () {
    await this.click(this.saveButton)
    const ProxyListPageObject = require('./ProxyListPageObject.js')
    return ProxyListPageObject.create(this._driver)
  }
}

module.exports = ProxyFormPageObject
