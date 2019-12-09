import m from '../../lib/mithril.js'

import FoxyProxyConverter from './FoxyProxyConverter.js'
import { uuidv4 } from '../util.js'

const t = browser.i18n.getMessage

export default class ImportPage {
  /**
   * @type {Proxy[]}
   */
  proxiesToImport

  /**
   * @type {Store}
   */
  store

  cleanUp

  foxyProxyFileInput

  constructor ({ store }) {
    this.store = store
    this.foxyProxyFileInput = new FileInput({
      title: t('ImportPage_foxyProxyInputLabel'),
      onChange: this.onChooseFile.bind(this)
    })
  }

  onChooseFile (event) {
    this.proxiesToImport = undefined
    const input = event.target
    this.cleanUp = () => {
      input.value = ''
    }

    if (input.files.length === 0) {
      return
    }
    const file = input.files[0]

    if (file.size > 1000000) {
      return
    }
    const reader = new FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = (evt) => {
      const fileContents = evt.target.result
      const converter = new FoxyProxyConverter()
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

    this.reset()
    // TODO Go to proxy list
  }

  reset () {
    this.proxiesToImport = undefined
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
  id
  title
  onChange

  constructor ({ title, onChange }) {
    this.title = title
    this.id = uuidv4()
    this.onChange = onChange
  }

  view ({ attrs: { class: className = '' } }) {
    const inputClasses = ['input__field']

    // TODO Add error handling

    const topClasses = ['input', className]
    return m('div', { class: topClasses.join(' ') }, [
      m('label', { class: 'input__label', for: this.id }, this.title),
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
