import m from './lib/mithril.js'
import {uuidv4} from './util.js'
import {style, proxyTypes} from './constants.js'

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

class Input {
    constructor(props) {
        this.title = props.title
        this.property = props.property
        this.required = !!props.required
        this.type = "text"
    }
    
    normalizeValue(v) {
        return v;
    }

    view(vnode) {
        return [
            m("label", this.title),
            m(
                "input",
                {
                    type: this.type,
                    class: style.textInput,
                    required: this.required,
                    value: ProxyModel.current[this.property],
                    oninput: (e) => ProxyModel.current[this.property] = e.target.value,
                    onchange: (e) => ProxyModel.current[this.property] = this.normalizeValue(e.target.value),
                }
            ),
        ]
    }
}



class TrimmedTextInput extends Input {
    normalizeValue(v) {
        return v.trim();
    }
}

class PositiveNumberInput extends Input {
    constructor(props) {
        super(props);
        this.type = 'number';
    }
    
    normalizeValue(v) {
        let parsed = Number.parseInt(v, 10);
        if (!parsed || parsed < 1) {
            parsed = 1
        }
        return parsed;
    }
}

class PasswordInput extends Input {
    constructor(props) {
        super(props);
        this.type = 'password';
    }
}

export class ProxyForm {
    constructor() {
        this.titleInput = new TrimmedTextInput({title: "Title (optional)", property: 'title'})
        this.hostInput = new TrimmedTextInput({title: 'Host/IP', property: 'host', required: true})
        this.portInput = new PositiveNumberInput({title: 'Port', property: 'port', required: true})
        this.usernameInput = new TrimmedTextInput({title: "Username", property: 'username'})
        this.passwordInput = new PasswordInput({title: "Password", property: 'password'})
        this.failoverTimeoutInput = new PositiveNumberInput({
            title: 'Failover Timeout (in seconds)',
            property: 'failoverTimeout'
        })
    }
    oninit(vnode) {
        ProxyModel.load(vnode.attrs.id)
    }
    view() {
        return m(
            "form",
            {class: style.form},
            [
                m('.mb-4', [m(this.titleInput)]),
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
                m('.mb-4', [m(this.hostInput)]),
                m('.mb-4', [m(this.portInput)]),
                m('.mb-4', [m(this.usernameInput)]),
                m('.mb-4', [m(this.passwordInput)]),
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
                m('.mb-4', [m(this.failoverTimeoutInput)]),
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
