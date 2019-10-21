import { Store } from '../store/Store.js'
import m from '../lib/mithril.js'
import { Layout } from './Layout.js'
import { ContainerListView } from './ContainerListView.js'
import { ProxyList } from './ProxyList.js'
import { ProxyForm } from './ProxyForm.js'
import SupportPage from './pages/SupportPage.js'

window.store = new Store()

const layout = new Layout()
const containerListView = new ContainerListView()
const proxyList = new ProxyList()
const proxyForm = new ProxyForm()

m.route(document.body, '/containers', {
  '/containers': {
    render: () => m(layout, m(containerListView))
  },
  '/proxies': {
    render: () => m(layout, m(proxyList))
  },
  '/proxies/:id': {
    render: vnode => m(layout, m(proxyForm, vnode.attrs))
  },
  '/support': {
    render: () => m(layout, m(SupportPage))
  }
})

document.title = browser.i18n.getMessage('OptionsPage_browserTabTitle')
