import { isDomainName, isIpV4Address, isIpV6Address } from '../predicates.js'
import { TrimmedTextInput } from '../ui-components/inputs.js'

export default class HostInput extends TrimmedTextInput {
  checkForError (v) {
    // TODO Add localization
    if (!v) {
      return 'Value cannot be empty'
    }

    const isIPv4 = isIpV4Address(v)
    const isIPv6 = isIpV6Address(v)
    const isDomain = isDomainName(v)

    if (!isIPv4 && !isIPv6 && !isDomain) {
      return 'Should be either IP address or domain name'
    }

    return null
  }
}
