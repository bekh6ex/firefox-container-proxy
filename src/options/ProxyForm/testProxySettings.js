import { generateAuthorizationHeader } from './../util.js'

/**
 *
 * @param settings
 * @return {Promise<TestResult>}
 */
export async function testProxySettings (settings) {
  // TODO Figure out Firefox extension requirements regarding calling 3rd party services

  let directIpQuery
  let directError
  try {
    directIpQuery = await fetchDirectIpData()
  } catch (e) {
    directError = e
  }

  let proxiedIpQuery
  let proxiedError
  try {
    proxiedIpQuery = await fetchProxiedIpData(settings)
  } catch (e) {
    proxiedError = e
  }

  const realRequestFailed = !directIpQuery
  const proxyRequestFailed = !proxiedIpQuery

  if (realRequestFailed) {
    if (proxyRequestFailed) {
      return new ConnectionIssueResult({ directError, proxiedError })
    } else {
      return new NoDirectConnectionResult({ directError, proxied: proxiedIpQuery })
    }
  } else {
    if (proxyRequestFailed) {
      return new SettingsErrorResult({ directIpQuery, proxiedError })
    } else {
      return new SuccessfulTestResult({ direct: directIpQuery, proxied: proxiedIpQuery })
    }
  }
}

const ipDataUrl = 'https://api.duckduckgo.com/?q=ip&no_html=1&format=json&t=firefox-container-proxy-extension'

function toQueryResponse (response) {
  if (response.AnswerType === 'ip') {
    return new IpQueryResponse({ ip: response.Answer })
  } else {
    throw new Error(`Unexpected response type: ${response.AnswerType}`)
  }
}

async function fetchDirectIpData () {
  return fetchIpData(ipDataUrl)
}

async function fetchProxiedIpData (proxyConfig) {
  const proxiedUrl = ipDataUrl
  const filter = { urls: [proxiedUrl] }
  return new Promise((resolve, reject) => {
    const listener = (requestDetails) => {
      // TODO Add support for HTTP
      browser.proxy.onRequest.removeListener(listener)

      let proxyAuthorizationHeader = ''
      if (proxyConfig.type === 'https') {
        proxyAuthorizationHeader = generateAuthorizationHeader(proxyConfig.username, proxyConfig.password)
      }

      return { ...proxyConfig, failoverTimeout: 1, proxyAuthorizationHeader }
    }

    const errorListener = (error) => {
      browser.proxy.onRequest.removeListener(listener)
      reject(error)
    }

    browser.proxy.onRequest.addListener(listener, filter)
    browser.proxy.onError.addListener(errorListener)

    const proxiedResultPromise = fetchIpData(proxiedUrl)
    proxiedResultPromise.then(r => {
      resolve(r)
    }).catch(e => {
      reject(e)
    })
  })
}

const ttlMs = 5000

async function fetchIpData (url) {
  const fetchParameters = {
    cache: 'no-cache',
    credentials: 'omit',
    redirect: 'error',
    referrer: 'no-referrer',
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en-US,en' // Blur the fingerprint a bit
    }
  }
  // TODO Cancel fetch request on timeout
  const ipResponsePromise = fetch(url, fetchParameters)
  const timeout = timeoutPromise(ttlMs)

  const result = Promise.race([ipResponsePromise, timeout])

  const response = (await (await result).json())
  return toQueryResponse(response)
}

function timeoutPromise (value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(value))
    }, value)
  })
}

export class TimeoutError extends Error {
  constructor (timeoutValue) {
    super(`Reached timeout of ${timeoutValue} ms`)
    this.timeoutValue = timeoutValue
  }
}

class IpQueryResponse {
  constructor ({ ip }) {
    this.ip = ip
  }
}

export class TestResult {

}

export class SuccessfulTestResult extends TestResult {
  /**
   * @param {IpQueryResponse} direct
   * @param {IpQueryResponse} proxied
   */
  constructor ({ direct, proxied }) {
    super()
    this.direct = direct
    this.proxied = proxied
  }

  get ipsMatch () {
    return this.direct.ip === this.proxied.ip
  }
}

/**
 * Proxy settings are incorrect
 */
export class SettingsErrorResult extends TestResult {
  /**
   *
   * @param {IpQueryResponse} directIpQuery
   * @param {Error} proxiedError
   */
  constructor ({ directIpQuery, proxiedError }) {
    super()
    this.direct = directIpQuery
    this.proxiedError = proxiedError
  }
}

export class ConnectionIssueResult extends TestResult {
  /**
   *
   * @param {Error} directError
   * @param {Error} proxiedError
   */
  constructor ({ directError, proxiedError }) {
    super()
    this.directError = directError
    this.proxiedError = proxiedError
  }
}

/**
 * Probably, not allowed to access internet directly
 */
export class NoDirectConnectionResult extends TestResult {
  /**
   *
   * @param {Error} directError
   * @param {IpQueryResponse} proxied
   */
  constructor ({ directError, proxied }) {
    super()
    this.directError = directError
    this.proxied = proxied
  }
}
