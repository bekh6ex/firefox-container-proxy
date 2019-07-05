
const store =  new Store()



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


