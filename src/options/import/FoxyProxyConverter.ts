import { ProxyDao } from '../../store/Store'

const typeMapping = {
  1: 'http',
  2: 'https',
  3: 'socks',
  4: 'socks4'
}

export default class FoxyProxyConverter {
  // @ts-expect-error
  convert (config): ProxyDao[] {
    // TODO: Add verification that config has a valid structure
    const proxiesToImport = Object.entries(config)
      // @ts-expect-error
      .filter(([_key, value]) => typeMapping[value.type])

    // @ts-ignore
    return proxiesToImport.map(([id, p]) => {
      // @ts-expect-error
      const type = typeMapping[p.type]
      const result = {
        id: id,
        type: type,
        // @ts-expect-error
        title: p.title,
        // @ts-expect-error
        host: p.address,
        // @ts-expect-error
        port: p.port,
        // @ts-expect-error
        username: p.username,
        // @ts-expect-error
        password: p.password,
        failoverTimeout: 5,
        doNotProxyLocal: true, // TODO: Check if can be imported
      }

      if (type === 'socks') {
        // @ts-expect-error
        result.proxyDNS = true
      }
      return result
    })
  }
}
