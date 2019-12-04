import { uuidv4 } from '../util.js'

const typeMapping = {
  1: 'http',
  2: 'https',
  3: 'socks',
  4: 'socks4'
}

export default class FoxyProxyConverter {
  convert (config) {
    const proxiesToImport = Object.entries(config)
      .filter(([_key, value]) => typeMapping[value.type])
      .map(([_key, value]) => value)

    return proxiesToImport.map(p => {
      const type = typeMapping[p.type]
      const result = {
        id: uuidv4(),
        type: type,
        title: p.title,
        host: p.address,
        port: p.port,
        username: p.username,
        password: p.password,
        failoverTimeout: 5
      }

      if (type === 'socks') {
        result.proxyDNS = true
      }
      return result
    })
  }
}
