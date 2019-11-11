const PageObject = require('./PageObject.js')
const { webdriver: { By } } = require('webextensions-geckodriver')
const SelectElementPageObject = require('./SelectElementPageObject.js')

class AssignPageObject extends PageObject {
  stableSelector = '.containers'

  defaultContainerRow = '.container-item:last-of-type'

  /**
   * @return {Promise<SelectElementPageObject>}
   */
  async defaultContainerSelect () {
    const row = await this.waitFor(this.defaultContainerRow)
    const select = row.findElement(By.css('select'))

    return new SelectElementPageObject(this._driver, select)
  }
}

module.exports = AssignPageObject
