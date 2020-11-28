import m, { Component, Vnode } from 'mithril'

export default class SupportPage implements Component {
  view (): Vnode {
    const gitterLink = 'https://gitter.im/firefox-container-proxy/community'
    return m('div', [
      browser.i18n.getMessage('SupportPage_gitterInvite') + ' ',
      m('a', { href: gitterLink }, 'Container Proxy community')
    ])
  }
}
