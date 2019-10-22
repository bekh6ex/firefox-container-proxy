import {generateAuthorizationHeader} from './util.js';

/**
 *
 * @param settings
 * @return {Promise<TestResult>}
 */
export async function testProxySettings(settings) {
  // TODO Figure out Firefox extension requirements regarding calling 3rd party services

  let directIpQuery;
  let directError;
  try {
    directIpQuery = await fetchDirectIpData();
  } catch (e) {
    directError = e;
  }

  let proxiedIpQuery;
  let proxiedError;
  try {
    proxiedIpQuery = await fetchProxiedIpData(settings);
  } catch (e) {
    proxiedError = e;
  }

  const realRequestFailed = !directIpQuery;
  const proxyRequestFailed = !proxiedIpQuery;

  if (realRequestFailed) {
    if (proxyRequestFailed) {
      return new ConnectionIssueResult({directError, proxiedError});
    } else {
      return new NoDirectConnectionResult({directError, proxied: proxiedIpQuery});
    }
  } else {
    if (proxyRequestFailed) {
      return new SettingsErrorResult({directIpQuery, proxiedError});
    } else {
      return new SuccessfulTestResult({direct: directIpQuery, proxied: proxiedIpQuery});
    }
  }
}

const ipDataUrl = 'https://geoip-db.com/json/';

function toQueryResponse(response) {
  // {"country_code":"DE","country_name":"Germany","city":"Berlin","postal":"10407","latitude":52.5336,"longitude":13.4492,"IPv4":"109.41.1.113","state":"Land Berlin"}

  const ip = response.IPv4 ? response.IPv4 : response.IPv6;

  const location = response.country_name + ', ' + response.city;

  return new IpQueryResponse({ip, location});
}

async function fetchDirectIpData() {
  return fetchIpData(ipDataUrl);
}

async function fetchProxiedIpData(proxyConfig) {
  const proxiedUrl = ipDataUrl;
  const filter = {urls: [proxiedUrl]};
  return new Promise((resolve, reject) => {
    const listener = (requestDetails) => {
      // TODO Add support for HTTP
      browser.proxy.onRequest.removeListener(listener);

      let proxyAuthorizationHeader = '';
      if (proxyConfig.type === 'https') {
        proxyAuthorizationHeader = generateAuthorizationHeader(proxyConfig.username, proxyConfig.password);
      }

      return {...proxyConfig, failoverTimeout: 1, proxyAuthorizationHeader};
    };

    const errorListener = (error) => {
      browser.proxy.onRequest.removeListener(listener);
      reject(error);
    };

    browser.proxy.onRequest.addListener(listener, filter);
    browser.proxy.onError.addListener(errorListener);

    const proxiedResultPromise = fetchIpData(proxiedUrl);
    proxiedResultPromise.then(r => {
      resolve(r);
    }).catch(e => {
      reject(e);
    });
  });
}

const ttlMs = 5000;

async function fetchIpData(url) {
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
  };
  // TODO Cancel fetch request on timeout
  const ipResponsePromise = fetch(url, fetchParameters);
  const timeout = timeoutPromise(ttlMs);

  const result = Promise.race([ipResponsePromise, timeout]);

  const response = (await (await result).json());
  return toQueryResponse(response);
}

function timeoutPromise(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(value));
    }, value);
  });
}

export class TimeoutError extends Error {
  constructor(timeoutValue) {
    super(`Reached timeout of ${timeoutValue} ms`);
    this.timeoutValue = timeoutValue;
  }
}

class IpQueryResponse {
  constructor({ip, location}) {
    this.ip = ip;
    this.location = location;
  }
}

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

/**
 * Proxy settings are incorrect
 */
export class SettingsErrorResult extends TestResult {
  direct
  proxiedError

  /**
   *
   * @param {IpQueryResponse} directIpQuery
   * @param {Error} proxiedError
   */
  constructor({directIpQuery, proxiedError}) {
    super();
    this.direct = directIpQuery;
    this.proxiedError = proxiedError;
  }
}

export class ConnectionIssueResult extends TestResult {
  /**
   *
   * @param {Error} directError
   * @param {Error} proxiedError
   */
  constructor({directError, proxiedError}) {
    super();
    this.directError = directError;
    this.proxiedError = proxiedError;
  }
}

/**
 * Probably, not allowed to access internet directly
 */
export class NoDirectConnectionResult extends TestResult {
  directError;
  proxied;

  /**
   *
   * @param {Error} directError
   * @param {IpQueryResponse} proxied
   */
  constructor({directError, proxied}) {
    super();
    this.directError = directError;
    this.proxied = proxied;
  }
}
