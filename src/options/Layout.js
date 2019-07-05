const Layout = {
    view: function (vnode) {
        const title = m('h1', 'Container proxies')
        const warning = m('h2', {style: 'background: yellow; text-align: center'}, 'It\'s ugly, but it\'s working!')
        const main = m("main.layout.px-2.flex.-mx-2", [
            m("nav.menu.w-1/6.flex-col", [
                m("a[href='/']", {oncreate: m.route.link, class: buttonClasses.join(' ')}, "Assign"),
                m("a[href='/proxies']", {oncreate: m.route.link, class: buttonClasses.join(' ')}, "Proxies")
            ]),
            m("section", vnode.children)
        ]);
        return [title, warning, main]
    }
}