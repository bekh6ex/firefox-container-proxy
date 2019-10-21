import { generateAuthorizationHeader } from './util.js'

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

class SettingsErrorResult extends TestResult {
}

export class ConnectionIssueResult extends TestResult {
  constructor ({ directError, proxiedError }) {
    super()
    this.directError = directError
    this.proxiedError = proxiedError
  }
}

class IpQueryResponse {
  constructor ({ ip, location }) {
    this.ip = ip
    this.location = location
  }
}
class NoDirectConnectionResult extends TestResult {
  constructor ({ directError, proxied }) {
    super()
  }
}

/**
 *
 * @param settings
 * @return {Promise<TestResult>}
 */
export async function testProxySettings (settings) {
  // TODO Figure out Firefox extension requirements regarding calling 3rd party services

  const realIpResponsePromise = await fetchDirectIpData()
  const proxyRequestPromise = await fetchProxiedIpData(settings)

  let directIpQuery
  let directError
  try {
    directIpQuery = await realIpResponsePromise
  } catch (e) {
    directError = e
  }

  let proxiedIpQuery
  let proxiedError
  try {
    proxiedIpQuery = await proxyRequestPromise
  } catch (e) {
    proxiedError = e
  }

  const realRequestFailed = !directIpQuery
  const proxyRequestFailed = !proxiedIpQuery

  if (realRequestFailed) {
    if (proxyRequestFailed) {
      return new ConnectionIssueResult({ directError, proxiedError })
    } else {
      // not allowed to access internet directly?
      throw new Error('Not implemented')
    }
  } else {
    if (proxyRequestFailed) {
      // proxy settings are incorrect
      throw new Error('Not implemented')
    } else {
      return new SuccessfulTestResult({ direct: directIpQuery, proxied: proxiedIpQuery })
    }
  }
}

const ipDataUrl = 'https://geoip-db.com/json/'

function toQueryResponse (response) {
  // {"country_code":"DE","country_name":"Germany","city":"Berlin","postal":"10407","latitude":52.5336,"longitude":13.4492,"IPv4":"109.41.1.113","state":"Land Berlin"}

  const ip = response.IPv4 ? response.IPv4 : response.IPv6

  const location = response.country_name + ', ' + response.city

  return new IpQueryResponse({ ip, location })
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

const ttl = 5000 // ms
async function fetchIpData (url) {
  // Send the most generic data to the service to prevent tracking
  const fetchParameters = {
    cache: 'no-cache',
    credentials: 'omit',
    redirect: 'error',
    referrer: 'no-referrer',
    headers: {
      'User-Agent': 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)',
      Accept: 'application/json',
      'Accept-Language': 'en'
    }
  }

  const ipResponsePromise = fetch(url, fetchParameters)
  const timeout = timeoutPromise(ttl)

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
