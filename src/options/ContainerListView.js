import m from './lib/mithril.js'

const ContainerListModel = {
    containers: [],
    proxies: [],
    proxiesById: {},
    relations: {},
    loadAll: async () => {
        ContainerListModel.containers = await browser.contextualIdentities.query({});
        ContainerListModel.proxies = await store.getAllProxies()
        ContainerListModel.proxies.forEach(p => ContainerListModel.proxiesById[p.id] = p)
        const result = await browser.storage.local.get('relations');
        ContainerListModel.relations = result.relations || {}
        m.redraw()
    },
    saveRelations: async () => {
        await browser.storage.local.set({relations: ContainerListModel.relations});
    }
}


function renderSelectProxy(cookieStoreId, proxyId) {
    const proxyOptions = ContainerListModel.proxies.map(p => m('option', {
        value: p.id,
        selected: p.id === proxyId
    }, p.title ? p.title : `${p.host}:${p.port}`));
    const defaultOption = m('option', {value: '', selected: !proxyId}, '<from network settings>')
    return m(
        'select',
        {
            oninput: (e) => {
                const proxyId = e.target.value
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

function renderContainerItem(container) {
    //{ name: "Personal", icon: "fingerprint", iconUrl: "resource://usercontext-content/fingerprint.svg", color: "blue", colorCode: "#37adff", cookieStoreId: "firefox-container-1" }

    const proxies = ContainerListModel.relations[container.cookieStoreId] || [];

    return m('.container-item', [
        m('.container-name', container.name),
        m('.attached-proxies', [
            renderSelectProxy(container.cookieStoreId, proxies[0])
        ]),
    ])
}

export class ContainerListView {
    oninit() {
        ContainerListModel.loadAll()
    }
    
    view() {
        const items = ContainerListModel.containers.map(renderContainerItem);
        const defaultContainer = renderContainerItem({
            cookieStoreId: 'firefox-default',
            name: '<default container>'
        })
        return m('.containers', [...items, defaultContainer])
    }
}


