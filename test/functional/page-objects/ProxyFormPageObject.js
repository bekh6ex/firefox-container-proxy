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

  constructor (driver) {
    super(driver)

    this.el = {
      protocol: By.css('.ProxyForm__connectionSettings select'),
      server: By.css('.ProxyForm__hostInput input'),
      port: By.css('.ProxyForm__portInput input'),
      username: By.css('.ProxyForm__credentials .input:first-of-type input'),
      password: By.css('.ProxyForm__credentials .input:last-of-type input'),
      testSettings: By.css('button[data-testid=testSettings]'),
      save: ProxyFormPageObject.saveButtonSelector(),
      directTestResult: By.css('[data-testid=directResult]'),
      proxiedTestResult: By.css('[data-testid=proxiedResult]')
    }
  }

  async selectProtocol (value) {
    const select = await this.waitForElement(this.el.protocol)
    return select.findElement(By.css(`option[value="${value}"]`)).click()
  }

  async typeInServer (value) {
    const input = this.driver.findElement(this.el.server)

    return input.sendKeys(value)
  }

  async typeInPort (value) {
    const input = this.driver.findElement(this.el.port)

    return input.sendKeys(value)
  }

  async typeInUsername (value) {
    const input = this.driver.findElement(this.el.username)

    return input.sendKeys(value)
  }

  async typeInPassword (value) {
    const input = this.driver.findElement(this.el.password)

    return input.sendKeys(value)
  }

  async testSettings () {
    const testSettingsButton = this.driver.findElement(this.el.testSettings)
    await testSettingsButton.click()

    await this.driver.wait(until.alertIsPresent(), 500)
    const confirm = await this.driver.switchTo().alert()
    await confirm.accept()

    const directTestResult = await this.driver.wait(until.elementLocated(
      this.el.directTestResult
    ), 11000)
    const directText = await directTestResult.getText()

    const testResultPattern = /^Your IP address is/
    assert.strictEqual(testResultPattern.test(directText), true)

    const proxiedTestResult = this.driver.findElement(this.el.proxiedTestResult)

    const proxiedText = await proxiedTestResult.getText()

    assert.strictEqual(proxiedText, directText)
  }

  saveButton () {
    return this.driver.findElement(this.el.save)
  }

  /**
   * @return {Promise<ProxyListPageObject>}
   */
  async saveSettings () {
    await this.driver.findElement(this.el.save).click()
    const ProxyListPageObject = require('./ProxyListPageObject.js')
    return ProxyListPageObject.create(this.driver)
  }
}

module.exports = ProxyFormPageObject
