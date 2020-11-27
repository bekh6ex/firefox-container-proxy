import {ProxyTypes} from './ProxyTypes'

export type ProxyInfo = Socks4ProxyInfo | Socks5ProxyInfo | HttpProxyInfo | HttpsProxyInfo

interface ProxyInfoBase {
  type: string
  host: string
  port: number
  failoverTimeout: number
}

export interface Socks5ProxyInfo extends ProxyInfoBase {
  type: ProxyTypes.Socks5
  username: string
  password: string
  proxyDNS: boolean
}

export interface Socks4ProxyInfo extends ProxyInfoBase {
  type: ProxyTypes.Socks4
  proxyDNS: boolean
}

export interface HttpsProxyInfo extends ProxyInfoBase {
  type: ProxyTypes.Https
  proxyAuthorizationHeader: string
}

export interface HttpProxyInfo extends ProxyInfoBase {
  type: ProxyTypes.Http
  proxyAuthorizationHeader: string
}
