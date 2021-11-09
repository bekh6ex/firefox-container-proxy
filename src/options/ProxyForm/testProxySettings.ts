import { ProxyInfo } from '../../domain/ProxyInfo'
import { ProxyDao } from '../../store/Store'

export interface SettingsToTest {
  type: string
  host: string
  port: number
  username: string
  password: string
  proxyDns?: boolean
}

/**
 *
 * @param settings
 * @return {Promise<TestResult>}
 */
export async function testProxySettings (settings: SettingsToTest): Promise<TestResult> {
  // TODO Refine user interaction according to https://extensionworkshop.com/documentation/publish/add-on-policies-2019-12/

  let directIpQuery
  let directError
  try {
    directIpQuery = await fetchDirectIpData()
  } catch (e) {
    directError = e
  }

  let proxiedIpQuery
  let proxiedError: Error|undefined
  try {
    proxiedIpQuery = await fetchProxiedIpData(settings)
  } catch (e) {
    // @ts-expect-error
    proxiedError = e
  }

  if (directIpQuery === undefined) {
    if (proxiedIpQuery === undefined) {
      // @ts-expect-error
      return new ConnectionIssueResult({ directError, proxiedError })
    } else {
      // @ts-expect-error
      return new NoDirectConnectionResult({ directError, proxied: proxiedIpQuery })
    }
  } else {
    if (proxiedIpQuery === undefined) {
      // @ts-expect-error
      return new SettingsErrorResult({ directIpQuery, proxiedError })
    } else {
      return new SuccessfulTestResult({ direct: directIpQuery, proxied: proxiedIpQuery })
    }
  }
}

const ipDataUrl: string = 'https://api.duckduckgo.com/?q=ip&no_html=1&format=json&t=firefox-container-proxy-extension'

function toQueryResponse (response: { AnswerType?: string, Answer: string }): IpQueryResponse {
  if (response.AnswerType === 'ip') {
    return new IpQueryResponse({ ip: response.Answer })
  } else {
    throw new Error(`Unexpected response type: ${response.AnswerType ?? '<empty>'}`)
  }
}

async function fetchDirectIpData (): Promise<IpQueryResponse> {
  return await fetchIpData(ipDataUrl)
}

async function fetchProxiedIpData (proxyConfig: SettingsToTest): Promise<IpQueryResponse> {
  const proxiedUrl = ipDataUrl
  const filter = { urls: [proxiedUrl] }
  const proxyInfo = ProxyDao.toProxyInfo(proxyConfig)
  if (proxyInfo === undefined) {
    throw new Error('Invalid proxy config')
  }
  return await new Promise((resolve, reject) => {
    const listener = (): ProxyInfo => {
      // TODO Add support for HTTP
      browser.proxy.onRequest.removeListener(listener)

      return proxyInfo
    }

    const errorListener = (error: Error): void => {
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

async function fetchIpData (url: string): Promise<IpQueryResponse> {
  const fetchParameters: RequestInit = {
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

async function timeoutPromise (value: number): Promise<never> {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(value))
    }, value)
  })
}

export class TimeoutError extends Error {
  readonly timeoutValue: any

  constructor (timeoutValue: number) {
    super(`Reached timeout of ${timeoutValue} ms`)
    this.timeoutValue = timeoutValue
  }
}

class IpQueryResponse {
  readonly ip: string

  constructor ({ ip }: { ip: string }) {
    this.ip = ip
  }
}

export type TestResult = SuccessfulTestResult | SettingsErrorResult | ConnectionIssueResult | NoDirectConnectionResult

export class SuccessfulTestResult {
  readonly direct: IpQueryResponse
  readonly proxied: IpQueryResponse

  constructor ({ direct, proxied }: { direct: IpQueryResponse, proxied: IpQueryResponse }) {
    this.direct = direct
    this.proxied = proxied
  }

  get ipsMatch (): boolean {
    return this.direct.ip === this.proxied.ip
  }
}

/**
 * Proxy settings are incorrect
 */
export class SettingsErrorResult {
  readonly direct: IpQueryResponse
  readonly proxiedError: Error

  constructor ({ directIpQuery, proxiedError }: { directIpQuery: IpQueryResponse, proxiedError: Error }) {
    this.direct = directIpQuery
    this.proxiedError = proxiedError
  }
}

export class ConnectionIssueResult {
  readonly directError: Error
  readonly proxiedError: Error

  constructor ({ directError, proxiedError }: { directError: Error, proxiedError: Error }) {
    this.directError = directError
    this.proxiedError = proxiedError
  }
}

/**
 * Probably, not allowed to access internet directly
 */
export class NoDirectConnectionResult {
  readonly directError: Error
  readonly proxied: IpQueryResponse

  constructor ({ directError, proxied }: { directError: Error, proxied: IpQueryResponse }) {
    this.directError = directError
    this.proxied = proxied
  }
}
