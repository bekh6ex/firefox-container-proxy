import m from './lib/mithril.js'
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
    const actions = m('div', [
      m('a[href=/proxies/new]', { oncreate: m.route.link, class: style.primaryButton }, '+')
    ])
    return [...items, actions]
  }

  renderProxyItem (p) {
    const text = p.title ? p.title : `${p.host}:${p.port}`
    const editButton = m('button.edit[type=button]', {
      href: '/proxies/' + p.id,
      oncreate: m.route.link,
      class: style.button
    }, 'edit')
    const deleteButton = m('button.delete[type=button]', {
      onclick: async () => {
        await this.model.delete(p.id)
        m.redraw()
      },
      class: style.button
    }, 'delete')

    return m('.proxy-list-item', [text, editButton, deleteButton])
  }
}
