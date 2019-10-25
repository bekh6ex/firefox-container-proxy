import m from '../../lib/mithril.js'

export class Input {
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
