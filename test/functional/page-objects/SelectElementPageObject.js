const PageObject = require('./PageObject.js')
const { webdriver: { By } } = require('webextensions-geckodriver')

class SelectElementPageObject extends PageObject {
  selectElement

  constructor (driver, element) {
    super(driver)
    this.selectElement = element
  }

  async selectByLabel (label) {
    const options = await this.selectElement.findElements(By.css('option'))
    let found
    for (const option of options) {
      const text = await option.getText()
      if (text === label) {
        found = option
        break
      }
    }

    await found.click()
  }
}

module.exports = SelectElementPageObject
