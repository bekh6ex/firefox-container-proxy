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

    const direct = (v) => m('span[data-testid=directResult]', [v])
    const proxied = (v) => m('span[data-testid=proxiedResult]', [v])

    if (result instanceof SuccessfulTestResult) {
      text = t('ProxySettingsTestResult_settingsAreCorrect')
      directBlock.push(m('b', ['Your real IP: ']), direct(result.direct.ip))
      proxiedBlock.push(m('b', ['Proxied IP: ']), proxied(result.proxied.ip))
    } else if (result instanceof ConnectionIssueResult) {
      text = t('ProxySettingsTestResult_notConnectedToTheInternet')
      directBlock.push(m('b', ['Direct request error: ']), direct(result.directError.message))
      proxiedBlock.push(m('b', ['Proxied request error: ']), proxied(result.proxiedError.message))
    } else if (result instanceof NoDirectConnectionResult) {
      text = t('ProxySettingsTestResult_noDirectConnection')
      directBlock.push(m('b', ['Direct request error: ']), direct(result.directError.message))
      proxiedBlock.push(m('b', ['Proxied IP: ']), proxied(result.proxied.ip))
    } else if (result instanceof SettingsErrorResult) {
      text = t('ProxySettingsTestResult_incorrectSettings')
      directBlock.push(m('b', ['Your real IP: ']), direct(result.direct.ip))
      proxiedBlock.push(m('b', ['Proxied request error: ']), proxied(result.proxiedError.message))
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
