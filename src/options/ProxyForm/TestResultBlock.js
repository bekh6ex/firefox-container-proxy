import {
  ConnectionIssueResult,
  NoDirectConnectionResult,
  SettingsErrorResult,
  SuccessfulTestResult
} from './testProxySettings.js'
import m from '../../lib/mithril.js'

const t = browser.i18n.getMessage

export default class TestResultBlock {
  /**
   * @param {TestResult} testResult
   */
  constructor (testResult) {
    this.testResult = testResult
  }

  view () {
    // TODO Add localization
    // TODO Add ru translations
    // TODO Improve design
    const result = this.testResult
    let text = 'Unexpected error'
    const directBlock = []
    const proxiedBlock = []
    if (result instanceof SuccessfulTestResult) {
      text = t('ProxySettingsTestResult_settingsAreCorrect')
      directBlock.push(m('b', ['Your real IP: ']), result.direct.ip)
      proxiedBlock.push(m('b', ['Proxied IP: ']), result.proxied.ip)
    } else if (result instanceof ConnectionIssueResult) {
      text = t('ProxySettingsTestResult_notConnectedToTheInternet')
      directBlock.push(m('b', ['Direct request error: ']), result.directError.message)
      proxiedBlock.push(m('b', ['Proxied request error: ']), result.proxiedError.message)
    } else if (result instanceof NoDirectConnectionResult) {
      text = t('ProxySettingsTestResult_noDirectConnection')
      directBlock.push(m('b', ['Direct request error: ']), result.directError.message)
      proxiedBlock.push(m('b', ['Proxied IP: ']), result.proxied.ip)
    } else if (result instanceof SettingsErrorResult) {
      text = t('ProxySettingsTestResult_incorrectSettings')
      directBlock.push(m('b', ['Your real IP: ']), result.direct.ip)
      proxiedBlock.push(m('b', ['Proxied request error: ']), result.proxiedError.message)
    } else {
      throw new Error('Unknown result type')
    }

    return m('.proxyFormTestResult', {}, [
      text,
      m('div', directBlock),
      m('div', proxiedBlock),
      m('div', [
        m('p', [
          m('a.ProxyForm__duckduckgo-attribution',
            { href: 'https://duckduckgo.com/?q=ip' },
            t('ProxyForm_duckduckgoAttribution')
          )
        ])
      ])
    ])
  }
}
