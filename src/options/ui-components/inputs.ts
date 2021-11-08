import m, { Component, Vnode } from 'mithril'
import { uuidv4 } from '../util'

export interface Props<ValueType> {
  title: string
  required?: boolean
  getValue: () => ValueType
  setValue: (v: ValueType) => void
  id?: string
  'data-testid'?: string
}

export abstract class BaseInput<ValueType> implements Component {
  title: string
  required: boolean
  getValue: () => ValueType
  setValue: (v: ValueType) => void
  id: string
  props: { [key: string]: string | number }
  errorText: string | null
  testId?: string

  constructor ({ title, required = false, getValue, setValue, id, ...rest }: Props<ValueType>) {
    this.title = title
    this.required = Boolean(required)
    this.getValue = getValue
    this.setValue = setValue
    this.id = id ?? uuidv4()
    this.props = {}
    this.testId = rest['data-testid']
    this.errorText = null
  }

  abstract get type (): string

  abstract extractValueFromEvent (event: InputEvent): ValueType

  normalizeValue (v: ValueType): ValueType {
    return v
  }

  onChange (v: ValueType): void {
    const normalizedValue = this.normalizeValue(v)
    this.errorText = this.checkForError(normalizedValue)
    this.setValue(normalizedValue)
    m.redraw()
  }

  get valid (): boolean {
    return this.errorText === null
  }

  /**
   * @param v Value
   * @return {string|null}
   */
  checkForError (v: ValueType): string | null {
    return null
  }

  view ({ attrs: { class: className = '', ...rest } }): Vnode {
    const inputClasses = ['input__field']
    if (!this.valid) {
      inputClasses.push('input--error__field')
    }

    const testId = this.testId !== undefined ? { 'data-testid': this.testId } : {}

    const topClasses = ['input', className]
    return m('div', { class: topClasses.join(' ') }, [
      m('label', { class: 'input__label', for: this.id }, this.title),
      m(
        'input',
        {
          ...this.props,
          ...rest,
          ...testId,
          id: this.id,
          type: this.type,
          class: inputClasses.join(' '),
          required: this.required,
          title: this.errorText,
          value: this.getValue(),
          oninput: (e: InputEvent) => this.setValue(this.extractValueFromEvent(e)),
          onchange: (e: InputEvent) => this.onChange(this.extractValueFromEvent(e)),
          onfocusout: (e: InputEvent) => this.onChange(this.extractValueFromEvent(e))
        }
      )
    ])
  }
}

export class TextInput extends BaseInput<string> {
  get type (): string {
    return 'text'
  }

  extractValueFromEvent (event: InputEvent): string {
    return (event.target as HTMLInputElement).value
  }
}

export class TrimmedTextInput extends TextInput {
  normalizeValue (v: string): string {
    return v.trim()
  }
}

export class PasswordInput extends TextInput {
  get type (): string {
    return 'password'
  }
}

export class CheckboxInput extends BaseInput<boolean> {
  get type (): string {
    return 'checkbox'
  }

  extractValueFromEvent (event: InputEvent): boolean {
    return (event.target as HTMLInputElement).checked
  }

  view ({ attrs: { class: className = '', disabled = false, ...rest } }): Vnode {
    const inputClasses = ['checkbox']
    if (!this.valid) {
      inputClasses.push('input--error__field')
    }

    const topClasses = ['checkbox-top', className]
    return m('div', { class: topClasses.join(' ') }, [

      m(
        'input',
        {
          ...this.props,
          ...rest,
          id: this.id,
          type: 'checkbox',
          class: inputClasses.join(' '),
          required: this.required,
          title: this.errorText,
          disabled,
          checked: this.getValue(),
          oninput: (e: InputEvent) => this.setValue(this.extractValueFromEvent(e)),
          onchange: (e: InputEvent) => this.onChange(this.extractValueFromEvent(e)),
          onfocusout: (e: InputEvent) => this.onChange(this.extractValueFromEvent(e))
        }
      ),
      m('label', { class: `input__label ${disabled ? 'checkbox--disabled__label__text' : ''}`, for: this.id, style: 'display: inline' }, this.title)
    ])
  }
}
