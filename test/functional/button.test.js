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
    assert.equal(await button.getAttribute('tooltiptext'), 'Container proxy')
  })

  it('should open extension options if the Toolbar Button is clicked', async () => {
    const button = await helper.toolbarButton()
    button.click()

    let handles
    await geckodriver.wait(async () => {
      handles = await geckodriver.getAllWindowHandles()
      return handles.length === 1
    }, 2000, 'Should have opened a new tab')

    geckodriver.setContext(firefox.Context.CONTENT)
    await geckodriver.switchTo().window(handles[0])

    await geckodriver.wait(async () => {
      const currentUrl = await geckodriver.getCurrentUrl()

      return currentUrl.endsWith('options/options.html#!/containers')
    }, 5000, 'Should have loaded options.html')
  })

  after(function () {
    geckodriver.quit()
  })
})
