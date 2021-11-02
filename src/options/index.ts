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

const containerListView = new ContainerListView()
const proxyForm = new ProxyForm()
const importPage = new ImportPage({ store })

m.route(document.body, '/containers', {
  '/containers': {
    render: () => m(Layout, m(containerListView))
  },
  '/proxies': {
    render: () => m(Layout, [m(ProxyList)])
  },
  '/proxies/import': {
    render: vnode => m(Layout, m(importPage, { ...vnode.attrs }))
  },
  '/proxies/:id': {
    render: vnode => m(Layout, m(proxyForm, vnode.attrs))
  },
  '/support': {
    render: () => {
      return m(Layout, m(SupportPage))
    }
  }
})

document.title = (globalThis as any).browser.i18n.getMessage('OptionsPage_browserTabTitle')
