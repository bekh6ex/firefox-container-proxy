import m, { ClassComponent, FactoryComponent, Vnode } from 'mithril'

export default class Navigation implements ClassComponent {
  view (): Vnode {
    return m('nav.nav', [
      m('section.nav__main', [
        m(NavItem, {
          href: '/containers',
          text: browser.i18n.getMessage('OptionsNavigation_assign'),
          classes: 'assign'
        }),
        m(NavItem, {
          href: '/proxies',
          text: browser.i18n.getMessage('OptionsNavigation_proxies'),
          classes: 'proxies'
        }),
      ]),
      m('section.nav__support', [
        m(NavItem, {
          href: '/support',
          text: browser.i18n.getMessage('OptionsNavigation_support'),
          classes: 'help'
        })
      ])

    ])
  }
}

type NavItemProps = { readonly href: string, text: string, classes: string }

const NavItem: FactoryComponent<NavItemProps> = () => {
  return {
    view: ({ attrs: { href, text, classes } }): Vnode => {
      const path = m.route.get()
      const active = path === href
      classes = classes + (active ? ' active' : '')
      href = '#!' + href
      return m('a.nav__item', { class: classes, href }, [
        m('.nav__item-icon'),
        m('.nav__item-label', text)
      ])
    }
  }
}
