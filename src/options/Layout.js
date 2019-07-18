import m from './lib/mithril.js'

export class Layout {   
    view(vnode) {
        const title = m('h1', browser.runtime.getManifest().name)
        const desc = m('p.header-description', browser.runtime.getManifest().description)
        const logo = m('.logo')
        const headerText = m('.header-text', [title, desc])
        const header = m('header', [logo, headerText]);
        const main = m("main", [
            m("nav.navigation", [
                m('div.item.assign', {oncreate: m.route.link, href:'/'}, [
                    m('.item-icon'),
                    m(".item-label", "Assign"),
                ]),
                m('div.item.proxies',{oncreate: m.route.link, href:'/proxies'}, [
                    m('.item-icon'),
                    m(".item-label", "Proxies")
                ]),
            ]),
            m("section", vnode.children)
        ]);
        return [header, main]
    }
}