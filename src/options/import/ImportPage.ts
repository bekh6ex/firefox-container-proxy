import m from 'mithril'

import FoxyProxyConverter from './FoxyProxyConverter'
import {uuidv4} from '../util'
import {ProxyDao, Store} from '../../store/Store'

const t = browser.i18n.getMessage

export default class ImportPage {
  proxiesToImport: ProxyDao[] = []
  store: Store

  cleanUp?: () => void

  foxyProxyFileInput: FileInput

  constructor({store}: { store: Store }) {
    this.store = store
    this.foxyProxyFileInput = new FileInput({
      title: t('ImportPage_foxyProxyInputLabel'),
      onChange: this.onChooseFile.bind(this)
    })
  }

  onChooseFile(event: InputEvent) {
    this.proxiesToImport = []
    const input = event.target as HTMLInputElement
    this.cleanUp = () => {
      input.value = ''
    }

    const files = input.files ?? []
    if (files.length === 0) {
      return
    }
    const file = files[0]

    if (file.size > 1000000) {
      return
    }
    const reader = new FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = (evt) => {
      // @ts-expect-error
      const fileContents = evt.target.result as string // TODO: `target` might be null, needs verification
      const converter = new FoxyProxyConverter()
      // @ts-expect-error
      this.proxiesToImport = converter.convert(JSON.parse(fileContents))

      m.redraw()
    }
    reader.onerror = function (evt) {
      console.error(evt)
    }
  }

  async doImport () {
    console.log('Importing: ', this.proxiesToImport)

    for (const proxy of this.proxiesToImport) {
      await this.store.putProxy(proxy)
    }

    m.route.set('/proxies')
    this.reset()
  }

  reset () {
    this.proxiesToImport = []
    if (this.cleanUp) {
      this.cleanUp()
    }
    m.redraw()
  }

  view () {
    let text = t('ImportPage_importButtonNoFileSelected')
    const canImport = this.proxiesToImport && this.proxiesToImport.length > 0
    if (canImport) {
      text = t('ImportPage_importButtonDoImport', this.proxiesToImport.length)
    }

    return m('section', [
      m('h2', t('ImportPage_heading')),
      m('form', [
        m(this.foxyProxyFileInput),
        m('button.button.button--primary', {
          disabled: !canImport,
          onclick: () => {
            this.doImport()
          }
        }, text)
      ])
    ])
  }
}

class FileInput {
  id: string
  title: string
  onChange: (e: InputEvent) => void

  constructor({title, onChange}: { title: string, onChange: (e: InputEvent) => void }) {
    this.title = title
    this.id = uuidv4()
    this.onChange = onChange
  }

  view({attrs: {class: className = ''}}) {
    const inputClasses = ['input__field']

    // TODO Add error handling

    const topClasses = ['input', className]
    return m('div', {class: topClasses.join(' ')}, [
      m('label', {class: 'input__label', for: this.id}, this.title),
      m(
          'input',
          {
          id: this.id,
          type: 'file',
          class: inputClasses.join(' '),
          onchange: this.onChange
        }
      )
    ])
  }
}
