import m, {Component, Vnode} from 'mithril'
import {ProxyDao, Store} from '../store/Store'

class ProxyListModel {
  list: ProxyDao[]

  constructor() {
    this.list = []
  }

  async loadList() {
    const store: Store = (window as any).store
    this.list = await store.getAllProxies()
  }

  async delete (id) {
    const store: Store = (window as any).store
    await store.deleteProxyById(id)
    await this.loadList()
  }
}

export class ProxyList implements Component {
  private readonly model: ProxyListModel

  constructor() {
    this.model = new ProxyListModel()
  }

  async oninit() {
    await this.model.loadList()
    m.redraw()
  }

  view(): Vnode[] {
    const items: Vnode[] = this.model.list.map(this.renderProxyItem.bind(this))
    const actions = m('div.ProxyList__list-actions', [
      // TODO: Finish import features
      // m('.proxy-button', [
      //   m('a[href=/proxies/import]', { oncreate: m.route.link, class: 'button' }, 'Import')
      // ]),
      m('.proxy-button', [
        // @ts-expect-error
        m('a[href=/proxies/new]', {oncreate: m.route.link, class: 'button button--primary'}, '+')
      ])
    ])
    return [...items, actions]
  }

  renderProxyItem(p): Vnode {
    const text = m('div.proxy-name', [p.title ? p.title : `${p.host}:${p.port}`])

    const editButton = m('button.edit[type=button]', {
      href: '/proxies/' + p.id,
      // @ts-expect-error
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
