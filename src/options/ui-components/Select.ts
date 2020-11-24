import m, {Component, Vnode} from 'mithril'
import {uuidv4} from '../util'

export default class Select implements Component {
  private readonly title: string
  private readonly required: boolean
  private readonly getValue: any
  private readonly setValue: any
  private readonly options: any
  private readonly id: string
  private readonly props: {}
  private valid: boolean
  private readonly errorText: string

  /**
   *
   * @param title
   * @param required
   * @param getValue
   * @param setValue
   * @param {object[]} options
   */
  constructor({title, required, getValue, setValue, options, id}: { title: any, required: any, getValue: any, setValue: any, options: object[], id?: string }) {
    this.title = title
    this.required = !!required
    this.getValue = getValue
    this.setValue = setValue
    this.options = options
    this.id = id || uuidv4()
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

  onChange(v): void {
    this.validate(v)
    this.setValue(v)
    m.redraw()
  }

  view(): Vnode {
    const selectClasses = ['input__field']
    if (!this.valid) {
      selectClasses.push('input--error__field')
    }

    const value = this.getValue()
    const options = this.options.map(({value, label}) => {
      return m('option', {value: value}, label)
    })

    return m('.select', [
      m('label.input__label', { for: this.id }, this.title),
      m(
        'select',
        {
          ...this.props,
          class: selectClasses.join(' '),
          id: this.id,
          required: this.required,
          title: this.errorText,
          value: value,
          onchange: (e) => this.onChange(e.target.value),
          onfocusout: (e) => this.onChange(e.target.value)
        },
        [
          ...options
        ]
      )
    ])
  }
}
