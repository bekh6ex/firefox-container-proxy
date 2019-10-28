import m from '../lib/mithril.js'
import { style } from './constants.js'

class ProxyListModel {
  constructor () {
    this.list = []
  }

  async loadList () {
    this.list = await store.getAllProxies()
  }

  async delete (id) {
    await store.deleteProxyById(id)
    await this.loadList()
  }
}

export class ProxyList {
  constructor () {
    this.model = new ProxyListModel()
  }

  async oninit () {
    await this.model.loadList()
    m.redraw()
  }

  view () {
    const items = this.model.list.map(this.renderProxyItem.bind(this))
    const actions = m('div.proxy-list-actions', [
      m('.proxy-button', [
        m('a[href=/proxies/new]', { oncreate: m.route.link, class: 'button button--primary' }, '+')
      ])
    ])
    return [...items, actions]
  }

  renderProxyItem (p) {
    const text = m('div.proxy-name', [p.title ? p.title : `${p.host}:${p.port}`])
    const editButton = m('button.edit[type=button]', {
      href: '/proxies/' + p.id,
      oncreate: m.route.link
    }, browser.i18n.getMessage('ProxyList_edit'))
    const deleteButton = m('button.delete[type=button]', {
      onclick: async () => {
        await this.model.delete(p.id)
        m.redraw()
      }
    }, browser.i18n.getMessage('ProxyList_delete'))

    return m('.proxy-list-item', [text, m('.ProxyList__item-actions', [editButton, deleteButton])])
  }
}
