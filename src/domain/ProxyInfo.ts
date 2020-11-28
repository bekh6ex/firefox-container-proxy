import { ProxyType } from './ProxyType'

export type ProxyInfo = Socks4ProxyInfo | Socks5ProxyInfo | HttpProxyInfo | HttpsProxyInfo

interface ProxyInfoBase {
  type: ProxyType
  host: string
  port: number
  failoverTimeout: number
}

export interface Socks5ProxyInfo extends ProxyInfoBase {
  type: ProxyType.Socks5
  username: string
  password: string
  proxyDNS?: boolean
}

export interface Socks4ProxyInfo extends ProxyInfoBase {
  type: ProxyType.Socks4
  proxyDNS: boolean
}

export interface HttpsProxyInfo extends ProxyInfoBase {
  type: ProxyType.Https
  proxyAuthorizationHeader: string
}

export interface HttpProxyInfo extends ProxyInfoBase {
  type: ProxyType.Http
  proxyAuthorizationHeader: string
}
