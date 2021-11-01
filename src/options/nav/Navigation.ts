import m, { ClassComponent, FactoryComponent, Vnode } from 'mithril'
import s from './Navigation.module.scss'

class Navigation implements ClassComponent {
  view (): Vnode {
    return m('nav', { class: s.nav }, [
      m('section', { class: s.main }, [
        m(NavItem, {
          href: '/containers',
          text: 'OptionsNavigation_assign',
          classes: s.assign,
          testId: 'assign'
        }),
        m(NavItem, {
          href: '/proxies',
          testId: 'proxies',
          text: 'OptionsNavigation_proxies',
          classes: s.proxies
        }),
      ]),
      m('section', { class: s.support }, [
        m(NavItem, {
          href: '/support',
          text: 'OptionsNavigation_support',
          classes: s.help,
          testId: 'support'
        })
      ])

    ])
  }
}

export default Navigation

type NavItemProps = { readonly href: string, text: string, classes: string, readonly testId: string }

const NavItem: FactoryComponent<NavItemProps> = () => {
  const t = browser.i18n.getMessage
  return {
    view: ({ attrs: { href, text, classes, testId } }): Vnode => {
      const path = m.route.get()
      const active = path === href
      classes = classes + (active ? ' ' + s.active : '')
      href = '#!' + href
      return m('a', { class: [s.item, classes].join(' '), href, 'test-id': testId }, [
        m('div', { class: s['item-icon'] }),
        m('div', { class: s['item-label'] }, [t(text)]),
      ])
    }
  }
}
