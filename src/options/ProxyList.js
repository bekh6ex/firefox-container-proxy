import m from './lib/mithril.js'
import {style} from './constants.js'


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
    const editButton = m('button.edit[type=button]', {
        href: '/proxies/' + p.id,
        oncreate: m.route.link,
        class:  style.action
    }, 'edit');
    const deleteButton = m('button.delete[type=button]', {
        oncreate: m.route.link,
        onclick: () => ProxyListModel.delete(p.id),
        class: style.action
    }, 'delete');
    return m('.proxy-list-item', [text, editButton, deleteButton])
}


export class ProxyList {
    oninit() {
        ProxyListModel.loadList()        
    } 
    view() {
        const items = ProxyListModel.list.map(renderProxyItem);
        const actions = m('.actions', [
            m('a[href=/proxies/new]', {oncreate: m.route.link, class: style.action }, "+")
        ])
        return [...items, actions]
    }
}