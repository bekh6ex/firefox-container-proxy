import {uuidv4} from '/options/util.js';


export class TestResult {

}

export class SuccessfulTestResult extends TestResult {

  /**
   * @param {IpQueryResponse} direct
   * @param {IpQueryResponse} proxied
   */
  constructor({direct, proxied}) {
    super();
    this.direct = direct;
    this.proxied = proxied;
  }

  get ipsMatch() {
    return this.direct.ip === this.proxied.ip;
  }
}

class SettingsErrorResult extends TestResult {
}

class ConnectionIssueResult extends TestResult {

}

class IpQueryResponse {
  constructor({ip, country, city}) {
    this.ip = ip;
    this.country = country;
    this.city = city;
  }
}
class NoDirectConnectionResult extends TestResult {
  constructor({directError, proxied }) {
    super();
  }
}

/**
 *
 * @param settings
 * @return {Promise<TestResult>}
 */
export async function testProxySettings(settings) {
  //TODO Figure out Firefox extension requirements regarding calling 3rd party services

  const realIpResponsePromise = fetchDirectIpData()
  const proxyRequestPromise = fetchProxiedIpData(settings)

  let realIpQuery
  realIpQuery = await realIpResponsePromise;


  let proxiedIpQuery;
  proxiedIpQuery = await proxyRequestPromise;


  const realRequestFailed = !realIpQuery;
  const proxyRequestFailed = !proxiedIpQuery;

  if (realRequestFailed) {
    if (proxyRequestFailed) {
      //connection issue
      throw new Error("Not implemented")
    } else {
      // not allowed to access internet directly?
      throw new Error("Not implemented")
    }
  } else {
    if (proxyRequestFailed) {
      //proxy settings are incorrect
      throw new Error("Not implemented")
    } else {
      //All is good
      return new SuccessfulTestResult({direct:realIpQuery, proxied:proxiedIpQuery})
    }
  }

}

const ipDataUrl = 'https://geoip-db.com/json/'

function toQueryResponse(response) {
  //{"country_code":"DE","country_name":"Germany","city":"Berlin","postal":"10407","latitude":52.5336,"longitude":13.4492,"IPv4":"109.41.1.113","state":"Land Berlin"}

  const ip = response.IPv4 ? response.IPv4 : response.IPv6;

  return new IpQueryResponse({ip, country: response.country_name, city: response.city});
}


async function fetchDirectIpData() {
  return fetchIpData(ipDataUrl)
}

async function fetchProxiedIpData(proxyConfig) {
  const someId = uuidv4()

  const proxiedUrl = ipDataUrl + "?__trackingId=" + someId;
  const filter = {urls: [proxiedUrl]};
  return new Promise((resolve, reject) => {
    const listener = (requestDetails) => {
      browser.proxy.onRequest.removeListener(listener)

      return {...proxyConfig, failoverTimeout: 1}
    };

    const errorListener = (error) => {
      browser.proxy.onRequest.removeListener(listener)
      reject(error)
    };

    browser.proxy.onRequest.addListener(listener, filter);
    browser.proxy.onError.addListener(errorListener)

    const proxiedResultPromise = fetchIpData(proxiedUrl)
    proxiedResultPromise.then(r => {
      resolve(r)
    }).catch(e => {
      reject(e)
    })
  });
}


const ttl = 5000 //ms
async function fetchIpData(url) {
  const fetchParameters = {
    cache: 'no-cache',
    credentials: 'omit',
    redirect: 'error',
    referrer: 'no-referrer'
  }

  const ipResponsePromise = fetch(url, fetchParameters)
  const timeout = timeoutPromise(ttl)

  const result = Promise.race([ipResponsePromise, timeout])

  const response = (await (await result).json())
  return toQueryResponse(response)
}

function timeoutPromise(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(value))
    }, value)
  })
}

export class TimeoutError extends Error {
  constructor(timeoutValue) {
    super(`Reached timeout of ${timeoutValue} ms`)
    this.timeoutValue = timeoutValue
  }
}
