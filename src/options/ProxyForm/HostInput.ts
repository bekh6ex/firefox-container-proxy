import {isDomainName, isIpV4Address, isIpV6Address} from '../predicates'
import {TrimmedTextInput} from '../ui-components/inputs'

export default class HostInput extends TrimmedTextInput {
  checkForError(v) {
    const isIPv4 = isIpV4Address(v)
    const isIPv6 = isIpV6Address(v)
    const isDomain = isDomainName(v)

    if (!isIPv4 && !isIPv6 && !isDomain) {
      return browser.i18n.getMessage('ProxyForm_incorrectServerError')
    }

    return null
  }
}
