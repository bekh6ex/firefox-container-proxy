const path = require('path')
const assert = require('assert')

const webExtensionsGeckoDriver = require('webextensions-geckodriver')
const { webdriver, firefox } = webExtensionsGeckoDriver
const { until, By } = webdriver

const manifestPath = path.resolve(path.join(__dirname, '../../src/manifest.json'))

describe('Example WebExtension', function () {
  let geckodriver, helper
  this.timeout(15000)

  before(async () => {
    const webExtension = await webExtensionsGeckoDriver(manifestPath)
    geckodriver = webExtension.geckodriver
    helper = {
      toolbarButton () {
        return geckodriver.wait(until.elementLocated(
          By.id('contaner-proxy_bekh-ivanov_me-browser-action')
        ), 1000)
      }
    }
  })

  it('should have a Toolbar Button', async () => {
    const button = await helper.toolbarButton()
    assert.strictEqual(await button.getAttribute('tooltiptext'), 'Container proxy')
  })

  it('should open extension options if the Toolbar Button is clicked', async () => {
    const button = await helper.toolbarButton()
    await button.click()
    await geckodriver.setContext(firefox.Context.CONTENT)

    let handles
    await geckodriver.wait(async () => {
      handles = await geckodriver.getAllWindowHandles()
      return handles.length === 1
    }, 2000, 'Should have opened a new tab')

    await geckodriver.switchTo().window(handles[0])

    await geckodriver.wait(async () => {
      const currentUrl = await geckodriver.getCurrentUrl()

      return currentUrl.endsWith('options/options.html#!/containers')
    }, 5000, 'Should have loaded options.html')

    const header = await geckodriver.wait(until.elementLocated(
      By.css('.header-text h1')
    ), 1000)

    const text = await header.getText()
    assert.strictEqual(text, 'Container proxy')
  })

  it('should add a proxy', async () => {
    const helper1 = new Helper(geckodriver)

    await helper1.openOptionsPage()

    await helper1.openProxyList()

    await (await helper1.addProxyButton()).click()

    await helper1.selectProtocol('socks')
    await helper1.typeInServer('localhost')
    await helper1.typeInPort(1080)
    await helper1.typeInUsername('user')
    await helper1.typeInPassword('password')

    await helper1.testSettings()

    await helper1.saveButton().click()

    return geckodriver.wait(async () => {
      const row = await geckodriver.wait(until.elementLocated(
        By.css('.proxy-list-item:first-of-type')
      ), 2000)

      const label = row.findElement(By.css('.proxy-name'))

      const text = await label.getText()
      return text === 'localhost:1080'
    }, 1000, 'Should show proxy in the list')
  })

  after(function () {
    geckodriver.quit()
  })
})

class Helper {
  constructor (driver) {
    this.driver = driver

    this.el = {
      toolbarButton: By.id('contaner-proxy_bekh-ivanov_me-browser-action'),
      header: By.css('.header-text h1'),
      nav: {
        proxies: By.css('.nav__item.proxies')
      },
      proxyList: {
        add: By.css('.proxy-list-actions .button.button--primary')
      },
      proxyForm: {
        protocol: By.css('.ProxyForm__connectionSettings select'),
        server: By.css('.ProxyForm__hostInput input'),
        port: By.css('.ProxyForm__portInput input'),
        username: By.css('.ProxyForm__credentials .input:first-of-type input'),
        password: By.css('.ProxyForm__credentials .input:last-of-type input'),
        testSettings: By.css('button[data-testid=testSettings]'),
        save: By.css('button[data-testid=save]'),
        directTestResult: By.css('[data-testid=directResult]'),
        proxiedTestResult: By.css('[data-testid=proxiedResult]'),
      }
    }
  }

  async toolbarButton () {
    await this.driver.setContext(firefox.Context.CHROME)
    return await this.waitForElement(
      this.el.toolbarButton
    )
  }

  async openOptionsPage () {
    const button = await this.toolbarButton()
    await button.click()
    await this.driver.setContext(firefox.Context.CONTENT)

    let handles
    await this.driver.wait(async () => {
      handles = await this.driver.getAllWindowHandles()
      return true
    }, 2000, 'Should have opened a new tab')

    await this.driver.switchTo().window(handles[handles.length - 1])

    return this.driver.wait(async () => {
      const header = await this.driver.wait(until.elementLocated(
        this.el.header
      ), 2000)

      const text = await header.getText()
      return text === 'Container proxy'
    }, 1000, 'Should have loaded options.html with header')
  }

  async openProxyList () {
    const proxies = await this.waitForElement(this.el.nav.proxies)
    return proxies.click()
  }

  async addProxyButton () {
    return await this.waitForElement(this.el.proxyList.add)
  }

  async waitForElement (el) {
    await this.driver.wait(until.elementLocated(el), 100)
    return this.driver.findElement(el)
  }

  async selectProtocol (value) {
    const select = await this.waitForElement(this.el.proxyForm.protocol)
    return select.findElement(By.css(`option[value="${value}"]`)).click()
  }

  async typeInServer (value) {
    const input = this.driver.findElement(this.el.proxyForm.server)

    return input.sendKeys(value)
  }

  async typeInPort (value) {
    const input = this.driver.findElement(this.el.proxyForm.port)

    return input.sendKeys(value)
  }

  async typeInUsername (value) {
    const input = this.driver.findElement(this.el.proxyForm.username)

    return input.sendKeys(value)
  }

  async typeInPassword (value) {
    const input = this.driver.findElement(this.el.proxyForm.password)

    return input.sendKeys(value)
  }

  async testSettings () {
    const testSettingsButton = this.driver.findElement(this.el.proxyForm.testSettings)
    await testSettingsButton.click()

    await this.driver.wait(until.alertIsPresent(), 500)
    const confirm = await this.driver.switchTo().alert()
    await confirm.accept()

    const directTestResult = await this.driver.wait(until.elementLocated(
      this.el.proxyForm.directTestResult
    ), 11000)
    const directText = await directTestResult.getText()

    const testResultPattern = /^Your IP address is/
    assert.equal(testResultPattern.test(directText), true)

    const proxiedTestResult = this.driver.findElement(this.el.proxyForm.proxiedTestResult)

    const proxiedText = await proxiedTestResult.getText()

    assert.equal(proxiedText, directText)
  }

  saveButton () {
    return this.driver.findElement(this.el.proxyForm.save)
  }

  async pause (time) {
    return this.driver.wait(async () => {
      return false
    }, time, 'Pause and fail')
  }
}
