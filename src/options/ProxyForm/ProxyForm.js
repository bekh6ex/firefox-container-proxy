import m from '../../lib/mithril.js'
import { uuidv4 } from './../util.js'
import { proxyTypes, style } from './../constants.js'
import { testProxySettings } from './testProxySettings.js'
import { PasswordInput, TrimmedTextInput } from '../ui-components/inputs.js'
import PortNumberInput from './PortInput.js'
import HostInput from './HostInput.js'
import TestResultBlock from './TestResultBlock.js'

const t = browser.i18n.getMessage

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

  async testSettings () {
    const settings = this.getSettings()
    if (settings.type === 'http') {
      alert('Testing HTTP proxies is not supported for now')
    }
    return testProxySettings(settings)
  }
}

export default class ProxyForm {
  constructor () {
    const model = new ProxyModel()
    this.model = model
    /** @type {TestResultBlock} */
    this.lastTestResultBlock = null

    this.titleInput = new TrimmedTextInput({ title: t('ProxyForm_titleFieldLabel'), ...model.accessProperty('title') })
    this.hostInput = new HostInput({
      title: t('ProxyForm_serverFieldLabel'),
      ...model.accessProperty('host'),
      required: true
    })
    this.portInput = new PortNumberInput({
      title: t('ProxyForm_portFieldLabel'),
      ...model.accessProperty('port'),
      required: true
    })
    this.usernameInput = new TrimmedTextInput({ title: t('ProxyForm_usernameFieldLabel'), ...model.accessProperty('username') })
    this.passwordInput = new PasswordInput({ title: t('ProxyForm_passwordFieldLabel'), ...model.accessProperty('password') })
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
            m('label.input__label', t('ProxyForm_protocolFieldLabel')),
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
              const result = await this.model.testSettings()
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
          }, t('ProxyForm_save')),
          ...testResultBlock
        ])
      ]
    )
  }
}
