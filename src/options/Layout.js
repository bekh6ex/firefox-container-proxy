import m from '../lib/mithril.js'

class NavItem {
  constructor (href, text, classes) {
    this.href = href
    this.text = text
    this.classes = classes
  }

  view (vnode) {
    const path = m.route.get()
    const active = path === this.href
    const classes = this.classes + (active ? ' active' : '')
    return m('div.item', { oncreate: m.route.link, class: classes, href: this.href }, [
      m('.item-icon'),
      m('.item-label', this.text)
    ])
  }
}

class Navigation {
  view (vnode) {
    return m('nav.navigation', [
      m(new NavItem('/containers', browser.i18n.getMessage('OptionsNavigation_assign'), 'assign')),
      m(new NavItem('/proxies', browser.i18n.getMessage('OptionsNavigation_proxies'), 'proxies'))
    ])
  }
}

export class Layout {
  view (vnode) {
    const title = m('h1', browser.runtime.getManifest().name)
    const desc = m('p.header-description', browser.i18n.getMessage('General_extensionDescription'))
    const logo = m('.logo')
    const headerText = m('.header-text', [title, desc])
    const header = m('header', [logo, headerText])
    const main = m('main', [
      m(new Navigation()),
      m('section', vnode.children)
    ])
    return [header, main]
  }
}
