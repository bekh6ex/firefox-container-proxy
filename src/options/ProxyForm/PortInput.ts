import { BaseInput, Props } from '../ui-components/inputs'

export default class PortNumberInput extends BaseInput<number> {
  readonly min: number = 1
  readonly max: number = 65535

  constructor (props: Props<number>) {
    super(props)
    this.props = { min: this.min, max: this.max }
  }

  get type (): string {
    return 'number'
  }

  extractValueFromEvent (event: InputEvent): number {
    const value = (event.target as HTMLInputElement).value
    return Number.parseInt(value, 10) ?? this.min
  }

  normalizeValue (value: number): number {
    let result = value
    if (result < this.min) {
      result = this.min
    } else if (result > this.max) {
      result = this.max
    }
    return result
  }
}
