import { MithrilPreactAdapter } from '../MithrilPreactAdapter'
import { VNode } from 'preact'

export default MithrilPreactAdapter(SupportPagePreact)

const gitterLink = 'https://gitter.im/firefox-container-proxy/community'

function SupportPagePreact (): VNode {
  return (
    <div>
      {browser.i18n.getMessage('SupportPage_gitterInvite') + ' '}
      <a href={gitterLink}>Container Proxy community</a>
    </div>
  )
}
