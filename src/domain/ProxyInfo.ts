import { ProxyType } from './ProxyType'

export type ProxyInfo = Socks4ProxyInfo | Socks5ProxyInfo | HttpProxyInfo | HttpsProxyInfo

interface ProxyInfoBase<TY extends ProxyType> {
  type: TY
  host: string
  port: number
  failoverTimeout: number
}

export interface Socks5ProxyInfo extends ProxyInfoBase<ProxyType.Socks5> {
  type: ProxyType.Socks5
  username: string
  password: string
  proxyDNS: boolean
}

export interface Socks4ProxyInfo extends ProxyInfoBase<ProxyType.Socks4> {
  type: ProxyType.Socks4
  proxyDNS: boolean
}

export interface HttpsProxyInfo extends ProxyInfoBase<ProxyType.Https> {
  type: ProxyType.Https
  proxyAuthorizationHeader: string
}

export interface HttpProxyInfo extends ProxyInfoBase<ProxyType.Http> {
  type: ProxyType.Http
  proxyAuthorizationHeader: string
}
