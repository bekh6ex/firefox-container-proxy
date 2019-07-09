import '../store/Store.js'
import m from './lib/mithril.js'
import {Layout} from './Layout.js'
import {ContainerListView} from './ContainerListView.js'
import {ProxyList} from './ProxyList.js'
import {ProxyForm} from './ProxyForm.js'

const Store = window.Store
window.store =  new Store()


m.route(document.body, "/containers", {
    "/containers": {
        render: function () {
            return m(Layout, m(ContainerListView))
        }
    },
    "/proxies": {
        render: function () {
            return m(Layout, m(ProxyList))
        }
    },
    "/proxies/:id": {
        render: function (vnode) {
            return m(Layout, m(ProxyForm, vnode.attrs))
        }
    },
})


