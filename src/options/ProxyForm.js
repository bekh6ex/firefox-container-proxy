import m from './lib/mithril.js';
import {uuidv4} from './util.js';
import {proxyTypes, style} from './constants.js';
import {SuccessfulTestResult, testProxySettings, TestResult} from './testProxySettings.js';

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
        /** @type {TestResultBlock} */
        this.lastTestResultBlock = null;

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
        if (this.lastTestResultBlock) {
            testResultBlock.push(m(this.lastTestResultBlock));
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
                            this.lastTestResultBlock = null;
                            const result = await testProxySettings(this.model.getSettings());
                            this.lastTestResultBlock = new TestResultBlock(result);
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

class TestResultBlock {

    /**
     * @param {TestResult} testResult
     */
    constructor(testResult) {
        this.testResult = testResult;
    }

    view() {
        const result = this.testResult;
        let text;
        let directBlock = [];
        let proxiedBlock = [];
        if (result instanceof SuccessfulTestResult) {
          text = result.ipsMatch ? "Error!" : "Success!";
          directBlock.push(m('b', ["Your real IP: "]), result.direct.ip)
          proxiedBlock.push(m('b', ["Proxied IP: "]), result.proxied.ip)
        } else {
            throw new Error("Unknown result type");
        }

      return m('.proxyFormTestResult', {}, [
        text,
        m('div', directBlock),
        m('div', proxiedBlock),
      ]);
    }
}
