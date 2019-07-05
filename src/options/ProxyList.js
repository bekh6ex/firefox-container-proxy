const ProxyListModel = {
    list: [],
    loadList: async () => {
        ProxyListModel.list = await store.getAllProxies()
        m.redraw()
    },
    current: {},
    delete: async (id) => {
        await store.deleteProxyById(id)
        await ProxyListModel.loadList()
    }
}

function renderProxyItem(p) {
    const text = p.title ? p.title : `${p.host}:${p.port}`;
    const editButton = m('a.edit', {
        href: '/proxies/' + p.id,
        oncreate: m.route.link,
        class: 'bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded'
    }, 'edit');
    const deleteButton = m('button.delete[type=button]', {
        oncreate: m.route.link,
        onclick: () => ProxyListModel.delete(p.id),
        class: 'bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded'
    }, 'delete');
    return m('.proxy-list-item', [text, editButton, deleteButton])
}


const ProxyList = {
    oninit: ProxyListModel.loadList,
    view: () => {
        const items = ProxyListModel.list.map(renderProxyItem);
        const actions = m('.actions', [
            m('a[href=/proxies/new]', {oncreate: m.route.link}, "New")
        ])
        return [...items, actions]
    }
}