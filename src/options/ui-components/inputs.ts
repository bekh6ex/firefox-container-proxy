import m, {Component, Vnode} from 'mithril'
import {uuidv4} from '../util'

export class Input implements Component {
    title: string
    required
    getValue
    setValue
    id: string
    type: string
    props
    errorText: string | null

    constructor({title, required = false, getValue, setValue, id}: { title: string, required?: boolean, getValue: any, setValue: any, id?: string }) {
        this.title = title
        this.required = Boolean(required)
        this.getValue = getValue
        this.setValue = setValue
        this.id = id || uuidv4()
        this.type = 'text'
        this.props = {}
        this.errorText = null
    }

    normalizeValue(v: string): string {
        return v
    }

    onChange(v: string): void {
        const normalizedValue = this.normalizeValue(v)
        this.errorText = this.checkForError(normalizedValue)
        this.setValue(normalizedValue)
        m.redraw()
    }

    get valid(): boolean {
        return this.errorText === null
    }

    /**
     * @param v Value
     * @return {string|null}
     */
    checkForError(v: string): string | null {
        return null
    }

    view({attrs: {class: className = ''}}): Vnode {
        const inputClasses = ['input__field']
        if (!this.valid) {
            inputClasses.push('input--error__field')
        }

        const topClasses = ['input', className]
        return m('div', {class: topClasses.join(' ')}, [
            m('label', {class: 'input__label', for: this.id}, this.title),
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
    normalizeValue(v: string) {
        return v.trim()
    }
}

export class PasswordInput extends Input {
  constructor (props) {
    super(props)
    this.type = 'password'
  }
}

export class CheckboxInput extends Input {
  constructor (props) {
    super(props)
    this.type = 'checkbox'
  }

  view ({ attrs: { class: className = '' } }) {
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
          oninput: (e) => this.setValue(e.target.checked),
          onchange: (e) => this.onChange(e.target.checked),
          onfocusout: (e) => this.onChange(e.target.checked)
        }
      ),
      m('label', { class: 'input__label', for: this.id, style: 'display: inline' }, this.title)
    ])
  }
}
