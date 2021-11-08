import m, { Vnode } from 'mithril'
import { uuidv4 } from '../util'
import { proxyTypes } from '../constants'
import { SettingsToTest, testProxySettings, TestResult } from './testProxySettings'
import { CheckboxInput, PasswordInput, TrimmedTextInput } from '../ui-components/inputs'
import PortNumberInput from './PortInput'
import HostInput from './HostInput'
import TestResultBlock from './TestResultBlock'
import Select from '../ui-components/Select'
import { ProxyDao, Store } from '../../store/Store'
import { ProxySettings } from '../../domain/ProxySettings'
import tryFromDao = ProxySettings.tryFromDao
import { ProxyType } from '../../domain/ProxyType'
import s from './ProxyForm.module.scss'

const t = browser.i18n.getMessage

const tid = (s: string): {'data-testid': string} => ({ 'data-testid': s })

export interface ModelData extends ProxyDao {
  id: string
  title: string
  type: string
  host: string
  port: number
  username: string
  password: string
  proxyDNS: boolean
  doNotProxyLocal: boolean
}

const NEW_PROXY: ModelData = {
  id: 'new',
  title: '',
  type: '',
  host: '',
  port: 1080,
  username: '',
  password: '',
  proxyDNS: true,
  doNotProxyLocal: true
}

class ProxyModel {
  current: ModelData

  constructor () {
    this.current = { ...NEW_PROXY }
  }

  async load (id: string): Promise<void> {
    const newProxy = { ...NEW_PROXY }
    if (id === 'new') {
      this.current = newProxy
      m.redraw()
      return
    }
    const store: Store = (window as any).store
    const settings = await store.getProxyById(id)
    if (settings !== null) {
      this.current = { ...NEW_PROXY, ...settings.asDao() }
    } else {
      this.current = newProxy
    }
    m.redraw()
  }

  async save (): Promise<boolean> {
    if (this.current.id === 'new') {
      this.current.id = uuidv4()
    }
    const store: Store = (window as any).store
    const settings = tryFromDao(this.current)
    if (settings === undefined) {
      return false
    } else {
      await store.putProxy(settings)
      return true
    }
  }

  accessProperty<K extends keyof ModelData> (property: K): { getValue: () => ModelData[K], setValue: (v: ModelData[K]) => void, 'data-testid': string } {
    return {
      getValue: () => this.current[property],
      setValue: (v: ModelData[K]) => {
        this.current[property] = v
      },
      ...tid(property)
    }
  }

  getSettings (): SettingsToTest {
    const { type, host, port, username, password } = this.current
    return { type, host, port, username, password }
  }

  async testSettings (): Promise<TestResult | null> {
    const settings = this.getSettings()
    if (settings.type === 'http') {
      alert('Testing HTTP proxies is not supported for now')
      return null
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
  proxyDNSCheckbox

  constructor () {
    const model = new ProxyModel()
    this.model = model
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
    this.proxyDNSCheckbox = new CheckboxInput({
      title: t('ProxyForm_proxyDnsFieldLabel'),
      ...model.accessProperty('proxyDNS')
    })
  }

  async oninit (vnode: Vnode): Promise<void> {
    await this.model.load((vnode.attrs as any).id)
  }

  view (): Vnode {
    const testResultBlock: Array<Vnode<any, any>> = []
    if (this.lastTestResultBlock !== null) {
      const lastTestResultBlock1: TestResultBlock = this.lastTestResultBlock
      testResultBlock.push(m(lastTestResultBlock1))
    }

    const isSocks = this.model.current.type === ProxyType.Socks4 || this.model.current.type === ProxyType.Socks5
    const isSocks4 = this.model.current.type === ProxyType.Socks4
    return m(
      'form',
      { ...tid('ProxyForm'), class: s.ProxyForm },
      [
        m('div', [m(this.titleInput, { class: 'ProxyForm__titleInput' })]),
        m(`div.${s.connectionSettings}`, [
          m(this.protocolSelect),
          m(`span.${s.separator}`, '://'),
          m(this.hostInput, { class: s.hostInput }),
          m(`span.${s.separator}`, ':'),
          m(this.portInput, { class: s.portInput })
        ]),
        (isSocks4
          ? [] : m(`div.${s.credentials}`, [
            m(this.usernameInput),
            m(this.passwordInput)
          ])
        ),
        m(`div.${s.advanced}`, [
          m(this.doNotProxyLocalCheckbox), (isSocks ? m(this.proxyDNSCheckbox) : [])
        ]),
        m(`div.${s.actions}`, [
          m('button[type=button]', {
            ...tid('testSettings'),
            onclick: async () => {
              const confirmed = confirm(t('ProxyForm_testProxySettingsConfirmationText'))
              if (!confirmed) {
                return
              }
              this.lastTestResultBlock = null
              const result = await this.model.testSettings()
              if (result === null) {
                return
              }
              this.lastTestResultBlock = new TestResultBlock(result)
              m.redraw()
            }
          }, t('ProxyForm_testProxySettingsLabel') + ' β'),
          m('button[type=button]', {
            ...tid('save'),
            onclick: async () => {
              const success = await this.model.save()
              if (success) {
                m.route.set('/proxies')
              }
            }
          }, t('ProxyForm_save')),
          ...testResultBlock
        ])
      ]
    )
  }
}
