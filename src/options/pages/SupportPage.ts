import m, {Component} from 'mithril'

export default class SupportPage {
  static view () {
    const gitterLink = 'https://gitter.im/firefox-container-proxy/community'
    return m('div', [
      browser.i18n.getMessage('SupportPage_gitterInvite') + ' ',
      m('a', { href: gitterLink }, 'Container Proxy community')
    ])
  }
}
