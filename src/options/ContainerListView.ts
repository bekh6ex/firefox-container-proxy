import m from 'mithril'
import {ProxyDao, Store} from '../store/Store'
import ContextualIdentity = browser.contextualIdentities.ContextualIdentity

class ContainerListModel {
  static containers: ContextualIdentity[] = []
  static proxies: ProxyDao[] = []
  static proxiesById: { [key: string]: ProxyDao } = {}
  static relations: { [key: string]: any } = {}

  static async loadAll(): Promise<void> {
    debugger
    ContainerListModel.containers = await browser.contextualIdentities.query({})
    const store: Store = (window as any).store
    ContainerListModel.proxies = await store.getAllProxies()
    ContainerListModel.proxies.forEach(p => {
      ContainerListModel.proxiesById[p.id] = p
    })
    const result = await browser.storage.local.get('relations')
    ContainerListModel.relations = result.relations ?? {}
    m.redraw()
  }

  static async saveRelations(): Promise<void> {
    await browser.storage.local.set({relations: ContainerListModel.relations})
  }
}

function renderSelectProxy(cookieStoreId: string, proxyId: string) {
  const proxyOptions = ContainerListModel.proxies.map(p => m('option', {
    value: p.id,
    selected: p.id === proxyId
  }, p.title ? p.title : `${p.host}:${p.port}`))
  const defaultOption = m('option', {
    value: '',
    selected: !proxyId
  }, browser.i18n.getMessage('ContainerList_proxyDisabled'))
  return m(
      'select',
      {
        oninput: (e: InputEvent) => {
          const proxyId = (e.target as HTMLSelectElement).value
          if (proxyId === '') {
            delete ContainerListModel.relations[cookieStoreId]
          } else {
            ContainerListModel.relations[cookieStoreId] = [proxyId]
          }
          ContainerListModel.saveRelations()
        }
      },
    [defaultOption, ...proxyOptions]
  )
}

interface ContainerInfo {
  name: string,
  icon: string,
  iconUrl: string,
  color: string,
  colorCode: string,
  cookieStoreId: string
}

function renderContainerItem(container: ContextualIdentity) {
  const proxies = ContainerListModel.relations[container.cookieStoreId] || []

  const classes = `identity-color-${container.color} identity-icon-${container.icon}`
  const icon = m('.container-icon')
  const name = m('.container-name', container.name)
  return m('.container-item', {class: classes}, [
    m('.container-label', [icon, name]),
    m('.attached-proxies', [
      renderSelectProxy(container.cookieStoreId, proxies[0])
    ])
  ])
}

export class ContainerListView {
  async oninit() {
    await ContainerListModel.loadAll()
    m.redraw()
  }

  view() {
    if (ContainerListModel.containers === undefined) {
      return
    }
    const items = ContainerListModel.containers.map(renderContainerItem)
    const defaultContainer = renderContainerItem({
      cookieStoreId: 'firefox-default',
      name: browser.i18n.getMessage('ContainerList_defaultContainerName'),
      color: '',
      colorCode: '',
      icon: '',
      iconUrl: ''
    })
    return m('.containers', [...items, defaultContainer])
  }
}
