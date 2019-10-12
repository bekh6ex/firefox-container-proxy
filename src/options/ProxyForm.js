import m from './lib/mithril.js';
import {uuidv4} from './util.js';
import {proxyTypes, style} from './constants.js';

class ProxyModel {
    constructor() {
        this.current = {}

    }

    async load(id) {
        if (id === 'new') {
            this.current = {id: 'new'}
            m.redraw()
            return
        }
        this.current = await store.getProxyById(id) || {id: 'new'}
        m.redraw()
    }
    async save() {
        if (this.current.id === 'new') {
            this.current.id = uuidv4()
        }
        await store.putProxy(this.current)
    }

    accessProperty(property) {
        return {
            getValue: () => this.current[property],
            setValue: (v) => this.current[property] = v
        }
    }

    getSettings() {
        const {type, host, port, username, password} = this.current;
        return {type, host, port, username, password};
    }
}

class Input {
    constructor(props) {
        this.title = props.title
        this.required = !!props.required
        this.getValue = props.getValue
        this.setValue = props.setValue
        this.type = "text"
    }

    normalizeValue(v) {
        return v;
    }

    view(vnode) {
        return m('div', {class: 'input'}, [
            m("label",{class: 'input__label'},  this.title),
            m(
                "input",
                {
                    type: this.type,
                    class: 'input__field',
                    required: this.required,
                    value: this.getValue(),
                    oninput: (e) => this.setValue(e.target.value),
                    onchange: (e) => this.setValue(this.normalizeValue(e.target.value)),
                    onfocusout: (e) => this.setValue(this.normalizeValue(e.target.value)),
                }
            ),
        ])
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
        const model = new ProxyModel();
        this.model = model
        /** @type {TestResult} */
        this.lastTestResult = null;

        this.titleInput = new TrimmedTextInput({title: "Title (optional)", ...model.accessProperty('title')})
        this.hostInput = new TrimmedTextInput({title: 'Host/IP', ...model.accessProperty('host'), required: true})
        this.portInput = new PositiveNumberInput({title: 'Port', ...model.accessProperty('port'), required: true})
        this.usernameInput = new TrimmedTextInput({title: "Username", ...model.accessProperty('username')})
        this.passwordInput = new PasswordInput({title: "Password", ...model.accessProperty('password')})
    }
    oninit(vnode) {
        this.model.load(vnode.attrs.id)
    }
    view() {

        const testResultBlock = [];
        if (this.lastTestResult) {
            const result = this.lastTestResult;
            const text = !result.success || result.ipsMatch ? "Error!" : "Success!"
            const children = [text];
            if (result.success) {
                children.push(m('b', ["Your real IP: "]))
                children.push(result.realIp)
                children.push(m('b', ["Proxied IP: "]))
                children.push(result.proxiedIp)
            } else {
                children.push(result.error.toString())
            }
            const testResult = m('.proxyFormTestResult', {}, [
              ...children
            ])
            testResultBlock.push(testResult)
        }

        return m(
            "form",
            {},
            [
                m('div', [m(this.titleInput)]),
                m('div', [
                    m("label.label", "Type"),
                    m(
                        "select.type",
                        {
                            value: this.model.current.type,
                            oninput: (e) => this.model.current.type = e.target.value
                        },
                        proxyTypes.map(t => m('option', {value: t}, t.toUpperCase()))),
                ]),
                m('div', [m(this.hostInput)]),
                m('div', [m(this.portInput)]),
                m('div', [m(this.usernameInput)]),
                m('div', [m(this.passwordInput)]),
                m('div', [
                    m("button[type=button]", {
                        class: style.button,
                        onclick: async () => {
                            this.lastTestResult = null;
                            const result = await test(this.model.getSettings());
                            this.lastTestResult = result;
                            m.redraw()
                        }
                    }, "Test"),
                    m("button[type=button]", {
                        class: style.button,
                        onclick: async () => {
                            await this.model.save()
                            m.route.set("/proxies")
                        }
                    }, "Save"),
                ]),
                ...testResultBlock

            ]
        )
    }
}

class TestResult {
    static success(realIp, proxiedIp) {
        return new TestResult(true, {realIp, proxiedIp})
    }

    static error(error) {
        new TestResult(false, {error})
    }
    constructor(success, {realIp, proxiedIp, error}) {
        this.success = success;
        this.realIp = realIp;
        this.proxiedIp = proxiedIp;
        this.error = error;

    }

    get ipsMatch() {
        return this.realIp === this.proxiedIp;
    }
}


/**
 *
 * @param parameters
 * @return {Promise<TestResult>}
 */
async function test(parameters) {
    //TODO Use https://ipinfo.io/json  Seems OK.
    //TODO Figure out Firefox extension requirements regarding calling 3rd party services
    const url = 'http://ip-api.com/json/';
    const fetchParameters = {
        cache: 'no-cache',
        credentials: 'omit',
        redirect: 'error',
        referrer: 'no-referrer'
    }

    const realIpResponsePromise = fetch(url, fetchParameters)

    const someId = uuidv4()

    const proxiedUrl = url + "?__trackingId=" + someId;
    const filter = {urls: [proxiedUrl]};
    const proxyRequestPromise = new Promise((resolve, reject) => {
        const listener = (requestDetails) => {
            browser.proxy.onRequest.removeListener(listener)

            return {...parameters, failoverTimeout: 1, proxyAuthorizationHeader:''}
        };

        const errorListener = (error) => {
            browser.proxy.onRequest.removeListener(listener)


            reject(error)
        };

        browser.proxy.onRequest.addListener(listener, filter);
        browser.proxy.onError.addListener(errorListener)

        const proxiedResultPromise = fetch(proxiedUrl, fetchParameters)
        proxiedResultPromise.then(r => {
            resolve(r)
        }).catch(e => {
            reject(e)
        })
    });


    const realIp = (await (await realIpResponsePromise).json()).query;
    try {
        const proxiedIp = (await (await proxyRequestPromise).json()).query;
        return TestResult.success(realIp, proxiedIp)

    } catch (e) {
        console.error(e);
        return TestResult.error(e);
    }

}
