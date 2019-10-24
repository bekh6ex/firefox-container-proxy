import m from '../lib/mithril.js'
import { uuidv4 } from './util.js'
import { proxyTypes, style } from './constants.js'
import {
  ConnectionIssueResult,
  NoDirectConnectionResult, SettingsErrorResult,
  SuccessfulTestResult,
  testProxySettings
} from './testProxySettings.js'
import { isDomainName, isIpV4Address, isIpV6Address } from './predicates.js'

class ProxyModel {
  constructor () {
    this.current = {}
  }

  async load (id) {
    if (id === 'new') {
      this.current = { id: 'new' }
      m.redraw()
      return
    }
    this.current = await store.getProxyById(id) || { id: 'new' }
    m.redraw()
  }

  async save () {
    if (this.current.id === 'new') {
      this.current.id = uuidv4()
    }
    await store.putProxy(this.current)
  }

  accessProperty (property) {
    return {
      getValue: () => this.current[property],
      setValue: (v) => {
        this.current[property] = v
      }
    }
  }

  getSettings () {
    const { type, host, port, username, password } = this.current
    return { type, host, port, username, password }
  }
}

class Input {
  constructor (props) {
    this.title = props.title
    this.required = !!props.required
    this.getValue = props.getValue
    this.setValue = props.setValue
    this.type = 'text'
    this.props = {}
    this.errorText = null
  }

  normalizeValue (v) {
    return v
  }

  onChange(v) {
    const normalizedValue = this.normalizeValue(v);
    this.errorText = this.checkForError(normalizedValue)
    this.setValue(normalizedValue)
    m.redraw()
  }

  get valid() {
    return this.errorText === null
  }

  /**
   * @param v Value
   * @return {string|null}
   */
  checkForError(v) {
    return null
  }

  view () {
    const inputClasses = ['input__field']
    if (!this.valid) {
      inputClasses.push('input--error__field')
    }

    return m('div', { class: 'input' }, [
      m('label', { class: 'input__label' }, this.title),
      m(
        'input',
        {
          ...this.props,
          type: this.type,
          class: inputClasses.join(' '),
          required: this.required,
          title: this.errorText,
          value: this.getValue(),
          oninput: (e) => this.setValue(e.target.value),
          onchange: (e) => this.onChange(e.target.value),
          onfocusout: (e) => this.onChange(e.target.value)
        }
      )
    ])
  }
}

class TrimmedTextInput extends Input {
  normalizeValue (v) {
    return v.trim()
  }
}

class PortNumberInput extends Input {
  constructor (props) {
    super(props)
    this.type = 'number'
    this.min = 1
    this.max = 65535
    this.props = { min: this.min, max: this.max }
  }

  normalizeValue (v) {
    let parsed = Number.parseInt(v, 10)
    if (!parsed || parsed < this.min) {
      parsed = this.min
    } else if (parsed > this.max) {
      parsed = this.max
    }
    return parsed
  }
}

class HostInput extends TrimmedTextInput {
  constructor(props) {
    super(props)
  }

  checkForError(v) {
    // TODO Add localization
    if (!v) {
      return "Value cannot be empty";
    }

    const isIPv4 = isIpV4Address(v);
    const isIPv6 = isIpV6Address(v);
    const isDomain = isDomainName(v);

    if (!isIPv4 && !isIPv6 && !isDomain) {
      return "Should be either IP address or domain name"
    }

    return null;
  }
}

class PasswordInput extends Input {
  constructor (props) {
    super(props)
    this.type = 'password'
  }
}

export class ProxyForm {
  constructor () {
    const model = new ProxyModel()
    this.model = model
    /** @type {TestResultBlock} */
    this.lastTestResultBlock = null

    this.titleInput = new TrimmedTextInput({ title: browser.i18n.getMessage('ProxyForm_titleFieldLabel'), ...model.accessProperty('title') })
    this.hostInput = new HostInput({
      title: browser.i18n.getMessage('ProxyForm_serverFieldLabel'),
      ...model.accessProperty('host'),
      required: true
    })
    this.portInput = new PortNumberInput({
      title: browser.i18n.getMessage('ProxyForm_portFieldLabel'),
      ...model.accessProperty('port'),
      required: true
    })
    this.usernameInput = new TrimmedTextInput({ title: browser.i18n.getMessage('ProxyForm_usernameFieldLabel'), ...model.accessProperty('username') })
    this.passwordInput = new PasswordInput({ title: browser.i18n.getMessage('ProxyForm_passwordFieldLabel'), ...model.accessProperty('password') })
  }

  oninit (vnode) {
    this.model.load(vnode.attrs.id)
  }

  view () {
    const testResultBlock = []
    if (this.lastTestResultBlock) {
      testResultBlock.push(m(this.lastTestResultBlock))
    }

    return m(
      'form',
      {},
      [
        m('div', [m(this.titleInput)]),
        m('div', [
          m('.input', [
            m('label.input__label', browser.i18n.getMessage('ProxyForm_protocolFieldLabel')),
            m(
              'select',
              {
                value: this.model.current.type,
                oninput: (e) => {
                  this.model.current.type = e.target.value
                }
              },
              proxyTypes.map(t => m('option', { value: t }, t.toUpperCase())))
          ])
        ]),
        m('div', [m(this.hostInput)]),
        m('div', [m(this.portInput)]),
        m('div', [m(this.usernameInput)]),
        m('div', [m(this.passwordInput)]),
        m('div', [
          m('button[type=button]', {
            class: style.button,
            onclick: async () => {
              this.lastTestResultBlock = null
              const settings = this.model.getSettings()
              if (settings.type === 'http') {
                alert('Testing HTTP proxies is not supported for now')
              }
              const result = await testProxySettings(settings)
              this.lastTestResultBlock = new TestResultBlock(result)
              m.redraw()
            }
          }, 'Test β'),
          m('button[type=button]', {
            class: style.button,
            onclick: async () => {
              await this.model.save()
              m.route.set('/proxies')
            }
          }, browser.i18n.getMessage('ProxyForm_save')),
          ...testResultBlock
        ])

      ]
    )
  }
}

class TestResultBlock {
  /**
   * @param {TestResult} testResult
   */
  constructor (testResult) {
    this.testResult = testResult
  }

  view () {
    // TODO Add localization
    // Improve design
    const result = this.testResult
    let text
    const directBlock = []
    const proxiedBlock = []
    if (result instanceof SuccessfulTestResult) {
      text = result.ipsMatch ? 'Error!' : 'Success!'
      directBlock.push(m('b', ['Your real IP: ']), result.direct.ip)
      proxiedBlock.push(m('b', ['Proxied IP: ']), result.proxied.ip)
    } else if (result instanceof ConnectionIssueResult) {
      text = 'Network error! Probably, you are not connected to the internet'
      directBlock.push(m('b', ['Direct request error: ']), result.directError.message)
      proxiedBlock.push(m('b', ['Proxied request error: ']), result.proxiedError.message)
    } else if (result instanceof NoDirectConnectionResult) {
      text = 'Warning! Seems that connection to the Internet without proxy is not possible, but proxy settings are correct'
      directBlock.push(m('b', ['Direct request error: ']), result.directError.message)
      proxiedBlock.push(m('b', ['Proxied IP: ']), result.proxied.ip)
    } else if (result instanceof SettingsErrorResult) {
      text = 'Error! Could not connect to the proxy. Probably the settings are incorrect'
      directBlock.push(m('b', ['Your real IP: ']), result.direct.ip)
      proxiedBlock.push(m('b', ['Proxied request error: ']), result.proxiedError.message)
    } else {
      throw new Error('Unknown result type')
    }

    return m('.proxyFormTestResult', {}, [
      text,
      m('div', directBlock),
      m('div', proxiedBlock)
    ])
  }
}
