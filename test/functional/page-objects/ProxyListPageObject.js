const PageObject = require('./PageObject.js')
const ProxyFormPageObject = require('./ProxyFormPageObject.js')

class ProxyListPageObject extends PageObject {
  addButton = '.proxy-list-actions .button.button--primary'

  stableSelector = this.addButton

  async openAddProxyForm () {
    await this.click(this.addButton)
    return this.createPageObject(ProxyFormPageObject)
  }
}

module.exports = ProxyListPageObject
