import m from '../../lib/mithril.js'

export default class Select {
  /**
   *
   * @param title
   * @param required
   * @param getValue
   * @param setValue
   * @param {object} options
   * @param nonsetValueText
   */
  constructor ({ title, required, getValue, setValue, options, nonsetValueText }) {
    this.title = title
    this.required = !!required
    this.getValue = getValue
    this.setValue = setValue
    this.options = options
    this.nonsetValueText = nonsetValueText
    this.props = {}
    this.valid = true
  }

  validate (v) {
    if (this.required && !v) {
      this.valid = false
    } else {
      this.valid = true
    }
  }

  onChange (v) {
    this.validate(v)
    this.setValue(v)
    m.redraw()
  }

  view () {
    const selectClasses = ['select__field']
    if (!this.valid) {
      selectClasses.push('select--error__field')
    }

    const value = this.getValue()
    const options = this.options.map(({ value, label }) => {
      return m('option', { value: value }, label)
    })

    return m('.select', [
      m('label.select__label', this.title),
      m(
        'select',
        {
          ...this.props,
          class: selectClasses.join(' '),
          required: this.required,
          title: this.errorText,
          value: value,
          onchange: (e) => this.onChange(e.target.value),
          onfocusout: (e) => this.onChange(e.target.value)
        },
        [
          m('option', { value: '' }, this.nonsetValueText),
          ...options
        ]
      )
    ])
  }
}
