import {
  ConnectionIssueResult,
  NoDirectConnectionResult,
  SettingsErrorResult,
  SuccessfulTestResult
} from './testProxySettings.js'
import m from '../../lib/mithril.js'

export default class TestResultBlock {
  /**
   * @param {TestResult} testResult
   */
  constructor (testResult) {
    this.testResult = testResult
  }

  view () {
    // TODO Add localization
    // TODO Improve design
    const result = this.testResult
    let text = "Unexpected error"
    const directBlock = []
    const proxiedBlock = []
    if (result instanceof SuccessfulTestResult) {
      text = result.ipsMatch ? 'Error!' : 'Success!'
      directBlock.push(m('b', ['Your real IP: ']), result.direct.ip)
      proxiedBlock.push(m('b', ['Proxied IP: ']), result.proxied.ip)
    } else if (result instanceof ConnectionIssueResult) {
      text = 'Network error! Probably, you are not connected to the internet'
      directBlock.push(m('b', ['Direct request error: ']), result.directError.message)
      proxiedBlock.push(m('b', ['Proxied request error: ']), result.proxiedError.message)
    } else if (result instanceof NoDirectConnectionResult) {
      text = 'Success! But... Seems that connection to the Internet without a proxy is not possible, but proxy settings are probably correct'
      directBlock.push(m('b', ['Direct request error: ']), result.directError.message)
      proxiedBlock.push(m('b', ['Proxied IP: ']), result.proxied.ip)
    } else if (result instanceof SettingsErrorResult) {
      text = 'Error! Could not connect to the proxy. Probably the settings are incorrect'
      directBlock.push(m('b', ['Your real IP: ']), result.direct.ip)
      proxiedBlock.push(m('b', ['Proxied request error: ']), result.proxiedError.message)
    } else {
      throw new Error('Unknown result type')
    }

    return m('.proxyFormTestResult', {}, [
      text,
      m('div', directBlock),
      m('div', proxiedBlock)
    ])
  }
}
