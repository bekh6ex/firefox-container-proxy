import m from '../lib/mithril.js'
import Navigation from './nav/Navigation.js'

export class Layout {
  view (vnode) {
    const title = m('h1', browser.runtime.getManifest().name)
    const desc = m('p.header-description', browser.i18n.getMessage('General_extensionDescription'))
    const logo = m('.logo')
    const headerText = m('.header-text', [title, desc])
    const header = m('header', [logo, headerText])
    const main = m('main', [
      m(new Navigation()),
      m('section.content', vnode.children)
    ])
    return [header, main]
  }
}
