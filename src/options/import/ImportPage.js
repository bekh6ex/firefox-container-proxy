import m from '../../lib/mithril.js'

import FoxyProxyConverter from './FoxyProxyConverter.js'

export default class ImportPage {
  /**
   * @type {Proxy[]}
   */
  proxiesToImport

  /**
   * @type {Store}
   */
  store

  constructor ({ store }) {
    this.store = store
  }

  onChooseFile (event) {
    this.proxiesToImport = undefined
    const input = event.target

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

    this.proxiesToImport = undefined
    m.redraw()
  }

  view () {
    let text = 'Select a file'
    const canImport = this.proxiesToImport && this.proxiesToImport.length > 0
    if (canImport) {
      text = `Import ${this.proxiesToImport.length} proxies`
    }

    // TODO Fix texts and add translations

    return m('section', [
      m('h2', 'Import'),
      m('form', [
        m('input', { type: 'file', onchange: this.onChooseFile.bind(this) }),
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
