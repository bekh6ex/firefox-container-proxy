import { ComponentType, render } from 'preact'
import { uuidv4 } from './util'
import m, { Children, Vnode, VnodeDOM } from 'mithril'

export function MithrilPreactAdapter<P> (Component: ComponentType<P>): m.ComponentTypes<P> {
  const uuid = uuidv4()
  const displayName = Component.displayName ?? Component.name ?? 'some-component'

  return class implements m.ClassComponent<P> {
    oncreate (vnode: m.VnodeDOM<P>): any {
      render(<Component {...vnode.attrs} />, vnode.dom)
    }

    onupdate (vnode: VnodeDOM<P>): any {
      render(<Component {...vnode.attrs} />, vnode.dom)
    }

    view (vnode: Vnode<P>): Children {
      return m(`div#preact-${displayName}-${uuid}`)
    }
  }
}
