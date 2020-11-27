import m, {Vnode} from 'mithril'
import {uuidv4} from '../util'
import {proxyTypes, style} from '../constants'
import {testProxySettings} from './testProxySettings'
import {CheckboxInput, PasswordInput, TrimmedTextInput} from '../ui-components/inputs'
import PortNumberInput from './PortInput'
import HostInput from './HostInput'
import TestResultBlock from './TestResultBlock'
import Select from '../ui-components/Select'
import {ProxyDao, Store} from '../../store/Store'

const t = browser.i18n.getMessage

const NEW_PROXY: ProxyDao = {
  id: 'new',
  title: '',
  type: '',
  host: '',
  port: 1080,
  username: '',
  password: '',
  proxyDNS: true,
  failoverTimeout: 5,
  doNotProxyLocal: true
}

class ProxyModel {
  current: ProxyDao

  constructor() {
    this.current = {...NEW_PROXY}
  }

  async load(id: string) {
    const newProxy = {...NEW_PROXY}
    if (id === 'new') {
      this.current = newProxy
      m.redraw()
      return
    }
    const store: Store = (window as any).store
    this.current = await store.getProxyById(id) ?? newProxy
    m.redraw()
  }

  async save(): Promise<void> {
    if (this.current.id === 'new') {
      this.current.id = uuidv4()
    }
    const store: Store = (window as any).store
    await store.putProxy(this.current)
  }

  accessProperty<K extends keyof ProxyDao>(property: K): { getValue: () => ProxyDao[K], setValue: (v: ProxyDao[K]) => void } {
    return {
      getValue: () => this.current[property],
      setValue: (v: ProxyDao[K]) => {
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
    return await testProxySettings(settings)
  }
}

export default class ProxyForm {
  model: ProxyModel
  lastTestResultBlock: TestResultBlock | null
  titleInput: TrimmedTextInput
  protocolSelect
  hostInput
  portInput
  usernameInput
  passwordInput
  doNotProxyLocalCheckbox

  constructor() {
    const model = new ProxyModel()
    this.model = model
    this.lastTestResultBlock = null

    this.titleInput = new TrimmedTextInput({title: t('ProxyForm_titleFieldLabel'), ...model.accessProperty('title')})
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

  oninit(vnode: Vnode) {
    this.model.load((vnode.attrs as any).id)
  }

  view() {
    const testResultBlock: Array<Vnode<any, any>> = []
    if (this.lastTestResultBlock) {
      const lastTestResultBlock1: TestResultBlock = this.lastTestResultBlock
      testResultBlock.push(m(lastTestResultBlock1))
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
            // class: style.button,
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
            // class: style.button,
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
