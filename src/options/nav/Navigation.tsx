import m, { ClassComponent, FactoryComponent, Vnode } from 'mithril'
import s from './Navigation.module.scss'

export default class Navigation implements ClassComponent {
  view (): Vnode {
    return m('nav', {class: s.nav}, [
      m('section', {class: s.main}, [
        m(NavItem, {
          href: '/containers',
          text: 'OptionsNavigation_assign',
          classes: s.assign
        }),
        m(NavItem, {
          href: '/proxies',
          text: 'OptionsNavigation_proxies',
          classes: s.proxies
        }),
      ]),
      m('section', {class: s.support},  [
        m(NavItem, {
          href: '/support',
          text: 'OptionsNavigation_support',
          classes: s.help
        })
      ])

    ])
  }
}

type NavItemProps = { readonly href: string, text: string, classes: string }

const NavItem: FactoryComponent<NavItemProps> = () => {
  const t = browser.i18n.getMessage
  return {
    view: ({ attrs: { href, text, classes } }): Vnode => {
      const path = m.route.get()
      const active = path === href
      classes = classes + (active ? ' ' + s.active : '')
      href = '#!' + href
      return <a class={[s.item, classes].join(' ')} href={href}>
        <div class={s['item-icon']}/>
        <div class={s['item-label']}>{t(text)}</div>
      </a>
    }
  }
}
