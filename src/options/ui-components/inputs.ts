import m, { Component, Vnode } from 'mithril'
import { uuidv4 } from '../util'

export interface Props<ValueType> {
  title: string
  required?: boolean
  getValue: () => ValueType
  setValue: (v: ValueType) => void
  id?: string
}

export abstract class BaseInput<ValueType> implements Component {
  title: string
  required: boolean
  getValue: () => ValueType
  setValue: (v: ValueType) => void
  id: string
  props: { [key: string]: string | number }
  errorText: string | null

  constructor ({ title, required = false, getValue, setValue, id }: Props<ValueType>) {
    this.title = title
    this.required = Boolean(required)
    this.getValue = getValue
    this.setValue = setValue
    this.id = id ?? uuidv4()
    this.props = {}
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

  view ({ attrs: { class: className = '' } }): Vnode {
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

  view ({ attrs: { class: className = '' } }): Vnode {
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
          id: this.id,
          type: 'checkbox',
          class: inputClasses.join(' '),
          required: this.required,
          title: this.errorText,
          checked: this.getValue(),
          oninput: (e: InputEvent) => this.setValue(this.extractValueFromEvent(e)),
          onchange: (e: InputEvent) => this.onChange(this.extractValueFromEvent(e)),
          onfocusout: (e: InputEvent) => this.onChange(this.extractValueFromEvent(e))
        }
      ),
      m('label', { class: 'input__label', for: this.id, style: 'display: inline' }, this.title)
    ])
  }
}
