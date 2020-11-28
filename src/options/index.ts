import { Store } from '../store/Store'
import m from 'mithril'
import { Layout } from './Layout'
import { ContainerListView } from './ContainerListView'
import { ProxyList } from './ProxyList'
import ProxyForm from './ProxyForm/ProxyForm'
import SupportPage from './pages/SupportPage'
import ImportPage from './import/ImportPage'

const store = new Store();
(globalThis as any).store = store

const layout = new Layout()
const containerListView = new ContainerListView()
const proxyList = new ProxyList()
const proxyForm = new ProxyForm()
const importPage = new ImportPage({ store })
const supportPage = new SupportPage()

m.route(document.body, '/containers', {
  '/containers': {
    render: () => m(layout, m(containerListView))
  },
  '/proxies': {
    render: () => m(layout, m(proxyList))
  },
  '/proxies/import': {
    render: vnode => m(layout, m(importPage, vnode.attrs))
  },
  '/proxies/:id': {
    render: vnode => m(layout, m(proxyForm, vnode.attrs))
  },
  '/support': {
    render: () => m(layout, m(supportPage))
  }
})

document.title = (globalThis as any).browser.i18n.getMessage('OptionsPage_browserTabTitle')
