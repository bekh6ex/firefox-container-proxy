import m from '../../lib/mithril.js'
import { uuidv4 } from './../util.js'
import { proxyTypes, style } from './../constants.js'
import { testProxySettings } from './testProxySettings.js'
import { CheckboxInput, PasswordInput, TrimmedTextInput } from '../ui-components/inputs.js'
import PortNumberInput from './PortInput.js'
import HostInput from './HostInput.js'
import TestResultBlock from './TestResultBlock.js'
import Select from '../ui-components/Select.js'

const t = browser.i18n.getMessage

class ProxyModel {
  constructor () {
    this.current = {}
  }

  async load (id) {
    const newProxy = { id: 'new', doNotProxyLocal: true }
    if (id === 'new') {
      this.current = newProxy
      m.redraw()
      return
    }
    this.current = await store.getProxyById(id) || newProxy
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
      return
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
    // TODO Add username/password pair validation
    this.usernameInput = new TrimmedTextInput({ title: t('ProxyForm_usernameFieldLabel'), ...model.accessProperty('username') })
    this.passwordInput = new PasswordInput({ title: t('ProxyForm_passwordFieldLabel'), ...model.accessProperty('password') })

    const protocolOptions = proxyTypes.map(v => ({ value: v, label: v === 'socks' ? 'SOCKS5' : v.toUpperCase() }))

    this.protocolSelect = new Select({
      title: t('ProxyForm_protocolFieldLabel'),
      required: true,
      ...model.accessProperty('type'),
      options: protocolOptions
    })

    this.doNotProxyLocalCheckbox = new CheckboxInput({
      title: t('ProxyForm_doNotProxyLocalFieldLabel'),
      ...model.accessProperty('doNotProxyLocal')
    })
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
        m('div', [m(this.titleInput, { class: 'ProxyForm__titleInput' })]),
        m('div.ProxyForm__connectionSettings', [
          m(this.protocolSelect),
          m('span.ProxyForm__separator', '://'),
          m(this.hostInput, { class: 'ProxyForm__hostInput' }),
          m('span.ProxyForm__separator', ':'),
          m(this.portInput, { class: 'ProxyForm__portInput' })
        ]),
        m('div.ProxyForm__credentials', [
          m(this.usernameInput),
          m(this.passwordInput)
        ]),
        m('div.ProxyForm__advanced', [
          m(this.doNotProxyLocalCheckbox)
        ]),
        m('div.ProxyForm__actions', [
          m('button[type=button]', {
            class: style.button,
            'data-testid': 'testSettings',
            onclick: async () => {
              const confirmed = confirm(t('ProxyForm_testProxySettingsConfirmationText'))
              if (!confirmed) {
                return
              }
              this.lastTestResultBlock = null
              const result = await this.model.testSettings()
              if (!result) {
                return
              }
              this.lastTestResultBlock = new TestResultBlock(result)
              m.redraw()
            }
          }, t('ProxyForm_testProxySettingsLabel') + ' β'),
          m('button[type=button]', {
            class: style.button,
            'data-testid': 'save',
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
