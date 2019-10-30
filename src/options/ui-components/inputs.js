import m from '../../lib/mithril.js'
import { uuidv4 } from '../util.js'

export class Input {
  constructor ({title, required, getValue, setValue, id}) {
    this.title = title
    this.required = !!required
    this.getValue = getValue
    this.setValue = setValue
    this.id = id || uuidv4()
    this.type = 'text'
    this.props = {}
    this.errorText = null
  }

  normalizeValue (v) {
    return v
  }

  onChange (v) {
    const normalizedValue = this.normalizeValue(v)
    this.errorText = this.checkForError(normalizedValue)
    this.setValue(normalizedValue)
    m.redraw()
  }

  get valid () {
    return this.errorText === null
  }

  /**
   * @param v Value
   * @return {string|null}
   */
  checkForError (v) {
    return null
  }

  view ({ attrs: { class: className = '' } }) {
    const inputClasses = ['input__field']
    if (!this.valid) {
      inputClasses.push('input--error__field')
    }

    const topClasses = ['input', className]
    return m('div', { class: topClasses.join(' ') }, [
      m('label', { class: 'input__label', for: this.id }, this.title),
      m(
        'input',
        {
          ...this.props,
          id: this.id,
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

export class TrimmedTextInput extends Input {
  normalizeValue (v) {
    return v.trim()
  }
}

export class PasswordInput extends Input {
  constructor (props) {
    super(props)
    this.type = 'password'
  }
}
