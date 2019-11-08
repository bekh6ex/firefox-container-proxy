const PageObject = require('./page-objects/PageObject.js')
const OptionsPageObject = require('./page-objects/OptionsPageObject.js')

const path = require('path')

const webExtensionsGeckoDriver = require('webextensions-geckodriver')
const { webdriver, firefox } = webExtensionsGeckoDriver
const { until, By } = webdriver

const manifestPath = path.resolve(path.join(__dirname, '../../src/manifest.json'))

describe('Container Proxy extension', function () {
  let geckodriver
  this.timeout(15000)

  before(async () => {
    const webExtension = await webExtensionsGeckoDriver(manifestPath)
    geckodriver = webExtension.geckodriver
  })

  it('should add a proxy', async () => {
    const helper = new Helper(geckodriver)

    const options = await helper.openOptionsPage()

    let proxyList = await options.openProxyList()

    const proxyForm = await proxyList.openAddProxyForm()

    await proxyForm.selectProtocol('socks')
    await proxyForm.typeInServer('localhost')
    await proxyForm.typeInPort(1080)
    await proxyForm.typeInUsername('user')
    await proxyForm.typeInPassword('password')

    await proxyForm.testSettings()

    proxyList = await proxyForm.saveSettings()

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

class Helper extends PageObject {
  constructor (driver) {
    super(driver)
    this.el = {
      toolbarButton: By.id('contaner-proxy_bekh-ivanov_me-browser-action'),

      proxyList: {
        add: By.css('.proxy-list-actions .button.button--primary')
      }
    }
  }

  async toolbarButton () {
    await this._driver.setContext(firefox.Context.CHROME)
    return this.waitFor(
      this.el.toolbarButton
    )
  }

  /**
   * @return {Promise<OptionsPageObject>}
   */
  async openOptionsPage () {
    const button = await this.toolbarButton()
    await button.click()
    await this._driver.setContext(firefox.Context.CONTENT)

    let windowHandle
    await this._driver.wait(async () => {
      windowHandle = await this._driver.getWindowHandle()
      return true
    }, 2000, 'Should have opened a new tab')

    await this._driver.switchTo().window(windowHandle)

    return OptionsPageObject.create(this._driver)
  }
}
