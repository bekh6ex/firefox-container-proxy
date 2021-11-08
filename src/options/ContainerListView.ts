import m, { Component, Vnode } from 'mithril'
import { Store } from '../store/Store'
import ContextualIdentity = browser.contextualIdentities.ContextualIdentity
import { ProxySettings } from '../domain/ProxySettings'

class ContainerListModel {
  containers: ContextualIdentity[] = []
  proxies: ProxySettings[] = []
  proxiesById: { [key: string]: ProxySettings } = {}
  relations: Map<string, string[]> = new Map<string, string[]>()
  enableIncognito: boolean = false

  async loadAll (): Promise<void> {
    this.containers = await browser.contextualIdentities.query({})
    const store: Store = (window as any).store
    this.proxies = await store.getAllProxies()
    this.proxies.forEach(p => {
      this.proxiesById[p.id] = p
    })
    const result = await browser.storage.local.get('relations')
    this.relations = new Map<string, string[]>(Object.entries(result.relations ?? {}))
    this.enableIncognito = await browser.extension.isAllowedIncognitoAccess()
    m.redraw()
  }

  async saveRelations (): Promise<void> {
    await browser.storage.local.set({ relations: Object.fromEntries(this.relations) })
  }
}

export class ContainerListView implements Component {
  model: ContainerListModel = new ContainerListModel()

  async oninit (): Promise<void> {
    await this.model.loadAll()
    m.redraw()
  }

  view (): Vnode | null {
    if (this.model.containers === undefined) {
      return null
    }
    const items = this.model.containers.map((i) => this.renderContainerItem(i))
    const defaultContainer = this.renderContainerItem({
      cookieStoreId: 'firefox-default',
      name: browser.i18n.getMessage('ContainerList_defaultContainerName'),
      color: '',
      colorCode: '',
      icon: 'default',
      iconUrl: ''
    })

    const privateContainer = this.model.enableIncognito ? this.renderContainerItem({
      cookieStoreId: 'firefox-private',
      name: browser.i18n.getMessage('ContainerList_privateBrowsingContainerName'),
      color: '',
      colorCode: '',
      icon: 'private-browsing',
      iconUrl: ''
    }) : []
    return m('.containers', [...items, defaultContainer, privateContainer])
  }

  renderSelectProxy (cookieStoreId: string, proxyId: string): Vnode {
    const proxyOptions = this.model.proxies.map(p => m('option', {
      value: p.id,
      selected: p.id === proxyId
    }, p.title !== '' ? p.title : p.url))
    const defaultOption = m('option', {
      value: '',
      selected: proxyId === ''
    }, browser.i18n.getMessage('ContainerList_proxyDisabled'))
    return m(
      'select',
      {
        oninput: async (e: InputEvent): Promise<void> => {
          const proxyId = (e.target as HTMLSelectElement).value
          if (proxyId === '') {
            this.model.relations.delete(cookieStoreId)
          } else {
            this.model.relations.set(cookieStoreId, [proxyId])
          }
          await this.model.saveRelations()
        }
      },
      [defaultOption, ...proxyOptions]
    )
  }

  renderContainerItem (container: ContextualIdentity): Vnode {
    const proxies = this.model.relations.get(container.cookieStoreId) ?? []

    const classes = `identity-color-${container.color} identity-icon-${container.icon}`
    const icon = m('.container-icon')
    const name = m('.container-name', container.name)
    return m('.container-item', { class: classes }, [
      m('.container-label', [icon, name]),
      m('.attached-proxies', [
        this.renderSelectProxy(container.cookieStoreId, proxies[0])
      ])
    ])
  }
}
