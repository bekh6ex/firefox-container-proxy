const Store = function () {

}

Store.prototype.getAllProxies = async function allProxies() {
    const result = await browser.storage.local.get('proxies');
    return result.proxies || [];
}

Store.prototype.getProxyById = async function getProxyById(id) {
    const proxies = await this.getAllProxies();
    const index = proxies.findIndex(p => p.id === id)
    return proxies[index]
}
Store.prototype.putProxy = async function putProxy(proxy) {
    const proxies = await this.getAllProxies();
    const index = proxies.findIndex(p => p.id === proxy.id)
    if (proxies[index]) {
        proxies[index] = proxy
    } else {
        proxies.push(proxy)
    }
    await browser.storage.local.set({proxies: proxies});
}

Store.prototype.deleteProxyById = async function deleteProxyById(id) {
    const proxies = await this.getAllProxies();
    const index = proxies.findIndex(p => p.id === id)
    if (proxies[index]) {
        proxies.splice(index, 1)
        await browser.storage.local.set({proxies: proxies});
    }
}

Store.prototype.getRelations = async function getRelations() {
    const result = await browser.storage.local.get('relations');
    return result.relations || {}
}

Store.prototype.getProxiesForContainer = async function getProxiesForContainer(cookieStoreId) {
    const relations = await this.getRelations()
    
    const proxyIds = relations[cookieStoreId] || []
    
    if (proxyIds.length === 0) {
        return [];
    }
    
    const proxies = await this.getAllProxies()
    const proxyById = {};
    proxies.forEach(p => proxyById[p.id] = p)

    const result = proxyIds.map(pId => proxyById[pId])
        .filter(p => !!p);
    return result
}