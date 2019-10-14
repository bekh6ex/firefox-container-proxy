import '../store/Store.js'
import m from './lib/mithril.js'
import { Layout } from './Layout.js'
import { ContainerListView } from './ContainerListView.js'
import { ProxyList } from './ProxyList.js'
import { ProxyForm } from './ProxyForm.js'

const Store = window.Store
window.store = new Store()

const layout = new Layout()
const containerListView = new ContainerListView()
const proxyList = new ProxyList()
const proxyForm = new ProxyForm()

m.route(document.body, '/containers', {
  '/containers': {
    render: function () {
      return m(layout, m(containerListView))
    }
  },
  '/proxies': {
    render: function () {
      return m(layout, m(proxyList))
    }
  },
  '/proxies/:id': {
    render: function (vnode) {
      return m(layout, m(proxyForm, vnode.attrs))
    }
  }
})
