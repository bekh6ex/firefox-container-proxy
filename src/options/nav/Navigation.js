import m from '../../lib/mithril.js'

export default class Navigation {
  view () {
    return m('nav.nav', [
      m('section.nav__main', [
        m(new NavItem('/containers', browser.i18n.getMessage('OptionsNavigation_assign'), 'assign')),
        m(new NavItem('/proxies', browser.i18n.getMessage('OptionsNavigation_proxies'), 'proxies'))
      ]),
      m('section.nav__support', [
        m(new NavItem('/support', browser.i18n.getMessage('OptionsNavigation_support'), 'help'))
      ])

    ])
  }
}

class NavItem {
  constructor (href, text, classes) {
    this.href = href
    this.text = text
    this.classes = classes
  }

  view () {
    const path = m.route.get()
    const active = path === this.href
    const classes = this.classes + (active ? ' active' : '')
    return m('div.nav__item', { oncreate: m.route.link, class: classes, href: this.href }, [
      m('.nav__item-icon'),
      m('.nav__item-label', this.text)
    ])
  }
}
