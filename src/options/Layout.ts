import m, { Component, Vnode } from 'mithril'
import Navigation from './nav/Navigation'

export class Layout implements Component {
  view (vnode: Vnode): Vnode[] {
    const title = m('h1', browser.runtime.getManifest().name)
    const desc = m('p.header-description', browser.i18n.getMessage('General_extensionDescription'))
    const logo = m('.logo')
    const headerText = m('.header-text', [title, desc])
    const header = m('header', [logo, headerText])
    const main = m('main', [
      m(Navigation),
      m('section.content', vnode.children)
    ])
    return [header, main]
  }
}
