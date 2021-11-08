const PageObject = require('./PageObject.js')
const { webdriver: { until, By } } = require('webextensions-geckodriver')
const assert = require('assert')

class ProxyFormPageObject extends PageObject {
  protocol = '[data-testid=ProxyForm] select'
  title = '[data-testid=ProxyForm] input[data-testid=title]'
  server = '[data-testid=ProxyForm] input[data-testid=host]'
  port = '[data-testid=ProxyForm] input[data-testid=port]'
  username = '[data-testid=ProxyForm] input[data-testid=username]'
  password = '[data-testid=ProxyForm] input[data-testid=password]'
  testSettingsButton = 'button[data-testid=testSettings]'
  saveButton = 'button[data-testid=save]'
  directTestResult = '[data-testid=directResult]'
  proxiedTestResult = '[data-testid=proxiedResult]'

  stableSelector = this.saveButton

  /**
   * @return {Promise<ProxyListPageObject>}
   */
  async addProxy ({ title, type, server, port, username, password }) {
    await this.typeInTitle(title)
    await this.selectProtocol(type)
    await this.typeInServer(server)
    await this.typeInPort(port)
    await this.typeInUsername(username)
    await this.typeInPassword(password)

    return this.saveSettings()
  }

  async typeInTitle (value) {
    return this.find(this.title).sendKeys(value)
  }

  async selectProtocol (value) {
    const select = await this.waitFor(this.protocol)
    return select.findElement(By.css(`option[value="${value}"]`)).click()
  }

  async typeInServer (value) {
    return this.find(this.server).sendKeys(value)
  }

  async typeInPort (value) {
    const el = this.find(this.port)
    await el.clear()
    return el.sendKeys(value)
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
    return this.createPageObject(ProxyListPageObject)
  }
}

module.exports = ProxyFormPageObject
