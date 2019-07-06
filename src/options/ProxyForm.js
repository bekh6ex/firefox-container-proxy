
const ProxyForm = (()=>{
    
    const ProxyModel = {
        current: {},
        load: async (id) => {
            if (id === 'new') {
                ProxyModel.current = {id: 'new'}
                m.redraw()
                return
            }
            ProxyModel.current = await store.getProxyById(id) || {id: 'new'}
            m.redraw()
        },
        save: async () => {
            if (ProxyModel.current.id === 'new') {
                ProxyModel.current.id = uuidv4()
            }
            await store.putProxy(ProxyModel.current)
        }
    }

    const ProxyForm = {
        oninit: function (vnode) {
            ProxyModel.load(vnode.attrs.id)
        },
        view: function () {
            return m(
                "form",
                {class: style.form},
                [
                    m('.mb-4', [
                        m("label.label", "Title (optional)"),
                        m(
                            "input.title",
                            {
                                class: style.textInput,
                                value: ProxyModel.current.title,
                                oninput: (e) => ProxyModel.current.title = e.target.value,
                            }
                        ),
                    ]),
                    m('.mb-4', [
                        m("label.label", "Type"),
                        m(
                            "select.type",
                            {
                                value: ProxyModel.current.type,
                                oninput: (e) => ProxyModel.current.type = e.target.value
                            },
                            proxyTypes.map(t => m('option', {value: t}, t.toUpperCase()))),
                    ]),
                    m('.mb-4', [
                        m("label.label", "Host/IP"),
                        m("input.host[required]", {
                            class: style.textInput,
                            value: ProxyModel.current.host,
                            oninput: (e) => ProxyModel.current.host = e.target.value
                        }),
                    ]),
                    m('.mb-4', [
                        m("label.label", "Port"),
                        m("input.port[type=number]", {
                            class: style.textInput,
                            value: ProxyModel.current.port,
                            oninput: (e) => ProxyModel.current.port = e.target.value
                        }),
                    ]),
                    m('.mb-4', [
                        m("label.label", "Username"),
                        m("input.username", {
                            class: style.textInput,
                            value: ProxyModel.current.username,
                            oninput: (e) => ProxyModel.current.username = e.target.value
                        }),
                    ]),
                    m('.mb-4', [
                        m("label.label", "Password"),
                        m("input.password", {
                            class: style.textInput,
                            value: ProxyModel.current.password,
                            oninput: (e) => ProxyModel.current.password = e.target.value
                        }),
                    ]),
                    m('.mb-4', [
                        m("label.label", {class: 'md:w-2/3 block'}, [
                            m("input.proxyDNS[type=checkbox]", {
                                class: 'mr-2 leading-tight',
                                value: ProxyModel.current.proxyDNS,
                                oninput: (e) => ProxyModel.current.proxyDNS = e.target.value
                            }),
                            "Proxy DNS (for sock5 and sock4 only)"
                        ]),
                    ]),
                    m('.mb-4', [
                        m("label.label", "Failover Timeout (in seconds)"),
                        m("input.failoverTimeout[type=number]", {
                            class: style.textInput,
                            value: ProxyModel.current.failoverTimeout,
                            oninput: (e) => ProxyModel.current.failoverTimeout = Number.parseInt(e.target.value, 10)
                        }),
                    ]),
                    m('.mb-4', [
                        m("button[type=button]", {
                            class: style.action,
                            onclick: async () => {
                                await ProxyModel.save()
                                m.route.set("/proxies")
                            }
                        }, "Save"),
                    ]),

                ]
            )
        }
    }
    
    return ProxyForm
})()
