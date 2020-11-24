
export interface ProxyDao {
  id: string
  title: string
  type: string
  host: string
  port: number
  username: string
  password: string
  proxyDNS?: boolean
  failoverTimeout: number
  doNotProxyLocal?: boolean
}

export class Store {
  async getAllProxies(): Promise<ProxyDao[]> {
    const result = await browser.storage.local.get('proxies')
    return (result as any).proxies as ProxyDao[] ?? []
  }

  async getProxyById(id): Promise<ProxyDao | null> {
    const proxies = await this.getAllProxies()
    const index = proxies.findIndex(p => p.id === id)
    if (index === -1) {
      return null
    } else {
      return fillInDefaults(proxies[index])
    }
  }

  async putProxy(proxy: ProxyDao): Promise<void> {
    proxy.failoverTimeout = 5

    if (proxy.type === 'socks' || proxy.type === 'socks4') {
      proxy.proxyDNS = true
    } else {
      delete proxy.proxyDNS
    }

    const proxies = await this.getAllProxies()
    const index = proxies.findIndex(p => p.id === proxy.id)
    if (index !== -1) {
      proxies[index] = proxy
    } else {
      proxies.push(proxy)
    }
    await browser.storage.local.set({ proxies: proxies })
  }

  async deleteProxyById(id: string): Promise<void> {
    const proxies = await this.getAllProxies()
    const index = proxies.findIndex(p => p.id === id)
    if (index !== -1) {
      proxies.splice(index, 1)
      await browser.storage.local.set({proxies: proxies})
    }
  }

  async getRelations(): Promise<{ [key: string]: string[] }> {
    const result = await browser.storage.local.get('relations')
    return result.relations as { [key: string]: string[] } ?? {}
  }

  async setContainerProxyRelation(cookieStoreId: string, proxyId: string): Promise<void> {
    const relations = await this.getRelations()
    relations[cookieStoreId] = [proxyId]

    await browser.storage.local.set({relations: relations})
  }

  async getProxiesForContainer(cookieStoreId: string): Promise<ProxyDao[]> {
    const relations = await this.getRelations()

    const proxyIds: string[] = relations[cookieStoreId] ?? []

    if (proxyIds.length === 0) {
      return []
    }

    const proxies = await this.getAllProxies()
    const proxyById: { [key: string]: ProxyDao } = {}
    proxies.forEach(function (p) { proxyById[p.id] = p })

    return proxyIds.map(pId => proxyById[pId])
        .filter(p => p !== undefined)
      .map(fillInDefaults)
  }
}

function fillInDefaults(proxy: ProxyDao): ProxyDao {
  if (typeof proxy.doNotProxyLocal === 'undefined') {
    proxy.doNotProxyLocal = true
  }
  return proxy
}
