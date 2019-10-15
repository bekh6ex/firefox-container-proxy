import m from './lib/mithril.js'
import { uuidv4 } from './util.js'
import { style, proxyTypes } from './constants.js'

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
      setValue: (v) => { this.current[property] = v }
    }
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
  }

  normalizeValue (v) {
    return v
  }

  view (vnode) {
    return m('div', { class: 'input' }, [
      m('label', { class: 'input__label' }, this.title),
      m(
        'input',
        {
          ...this.props,
          type: this.type,
          class: 'input__field',
          required: this.required,
          value: this.getValue(),
          oninput: (e) => this.setValue(e.target.value),
          onchange: (e) => this.setValue(this.normalizeValue(e.target.value)),
          onfocusout: (e) => this.setValue(this.normalizeValue(e.target.value))
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

    this.titleInput = new TrimmedTextInput({ title: browser.i18n.getMessage('proxyFormTitle'), ...model.accessProperty('title') })
    this.hostInput = new TrimmedTextInput({ title: browser.i18n.getMessage('proxyFormServer'), ...model.accessProperty('host'), required: true })
    this.portInput = new PortNumberInput({ title: browser.i18n.getMessage('proxyFormPort'), ...model.accessProperty('port'), required: true })
    this.usernameInput = new TrimmedTextInput({ title: browser.i18n.getMessage('proxyFormUsername'), ...model.accessProperty('username') })
    this.passwordInput = new PasswordInput({ title: browser.i18n.getMessage('proxyFormPassword'), ...model.accessProperty('password') })
  }

  oninit (vnode) {
    this.model.load(vnode.attrs.id)
  }

  view () {
    return m(
      'form',
      {},
      [
        m('div', [m(this.titleInput)]),
        m('div', [
          m('.input', [
            m('label.input__label', browser.i18n.getMessage('proxyFormProtocol')),
            m(
              'select.input__field',
              {
                value: this.model.current.type,
                oninput: (e) => { this.model.current.type = e.target.value }
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
              await this.model.save()
              m.route.set('/proxies')
            }
          }, browser.i18n.getMessage('proxyFormSave'))
        ])

      ]
    )
  }
}
