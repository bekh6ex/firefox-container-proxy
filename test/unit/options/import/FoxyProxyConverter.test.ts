import FoxyProxyConverter from '../../../../src/options/import/FoxyProxyConverter'

const { expect } = require('chai')
const fs = require('fs')
const path = require('path')

describe('FoxyProxy converter', () => {
  const foxyProxyConverter = new FoxyProxyConverter()
  const defaultFailoverTimeout = 5

  it('should convert SOCKS5 settings to Container Proxy format', () => {
    const config = {
      'some-id-1': {
        type: 3,
        color: '#66cc66',
        title: 'Socks5 title',
        active: true,
        address: 'socks5.proxy.com',
        port: 1080,
        proxyDNS: false,
        username: 'socks5-username',
        password: 'socks5-password',
        whitePatterns: [],
        blackPatterns: [],
        pacURL: '',
        index: 12345
      }
    }

    const proxies = foxyProxyConverter.convert(config)

    expect(proxies).to.be.an('array')
    const result = proxies[0]
    expect(result.id).to.be.equal('some-id-1')
    expect(result.type).to.be.equal('socks')
    expect(result.title).to.be.equal('Socks5 title')
    expect(result.host).to.be.equal('socks5.proxy.com')
    expect(result.port).to.be.equal(1080)
    expect(result.username).to.be.equal('socks5-username')
    expect(result.password).to.be.equal('socks5-password')
    expect(result.proxyDNS).to.be.equal(true)
  })

  it('should convert SOCKS4 settings to Container Proxy format', () => {
    const config = {
      'some-id-2': {
        type: 4,
        color: '#66cc66',
        title: 'Socks4 title',
        active: true,
        address: 'socks4.proxy.com',
        port: 1080,
        proxyDNS: false,
        username: 'socks4-username',
        password: 'socks4-password',
        whitePatterns: [],
        blackPatterns: [],
        pacURL: '',
        index: 12345
      }
    }

    const proxies = foxyProxyConverter.convert(config)

    expect(proxies).to.be.an('array')
    const result = proxies[0]
    expect(result.id).to.be.equal('some-id-2')
    expect(result.type).to.be.equal('socks4')
    expect(result.title).to.be.equal('Socks4 title')
    expect(result.host).to.be.equal('socks4.proxy.com')
    expect(result.port).to.be.equal(1080)
    expect(result.username).to.be.equal('socks4-username')
    expect(result.password).to.be.equal('socks4-password')
    expect(result.proxyDNS).to.be.undefined
  })

  it('should convert HTTP settings to Container Proxy format', () => {
    const config = {
      'some-id-3': {
        type: 1,
        color: '#66cc66',
        title: 'HTTP title',
        active: true,
        address: 'http.proxy.com',
        port: 80,
        proxyDNS: false,
        username: 'http-username',
        password: 'http-password',
        whitePatterns: [],
        blackPatterns: [],
        pacURL: '',
        index: 12345
      }
    }

    const proxies = foxyProxyConverter.convert(config)

    expect(proxies).to.be.an('array')
    const result = proxies[0]
    expect(result.id).to.be.equal('some-id-3')
    expect(result.type).to.be.equal('http')
    expect(result.title).to.be.equal('HTTP title')
    expect(result.host).to.be.equal('http.proxy.com')
    expect(result.port).to.be.equal(80)
    expect(result.username).to.be.equal('http-username')
    expect(result.password).to.be.equal('http-password')
    expect(result.proxyDNS).to.be.undefined
  })

  it('should convert HTTP settings to Container Proxy format', () => {
    const config = {
      'some-id-4': {
        type: 2,
        color: '#66cc66',
        title: 'HTTPS title',
        active: true,
        address: 'https.proxy.com',
        port: 443,
        proxyDNS: false,
        username: 'https-username',
        password: 'https-password',
        whitePatterns: [],
        blackPatterns: [],
        pacURL: '',
        index: 9007199254740987
      }
    }

    const proxies = foxyProxyConverter.convert(config)

    expect(proxies).to.be.an('array')
    const result = proxies[0]
    expect(result.id).to.be.equal('some-id-4')
    expect(result.type).to.be.equal('https')
    expect(result.title).to.be.equal('HTTPS title')
    expect(result.host).to.be.equal('https.proxy.com')
    expect(result.port).to.be.equal(443)
    expect(result.username).to.be.equal('https-username')
    expect(result.password).to.be.equal('https-password')
    expect(result.proxyDNS).to.be.undefined
  })

  it('should ignore the Direct "proxy"', () => {
    const config = {
      'some-id-5': {
        type: 5,
        color: '#66cc66',
        title: 'Direct title',
        active: true,
        whitePatterns: [],
        blackPatterns: [],
        pacURL: 'http://example.com',
        index: 12345
      }
    }

    const proxies = foxyProxyConverter.convert(config)

    expect(proxies).to.be.an('array')
    expect(proxies.length).to.be.equal(0)
  })

  it('should parse only known proxy types', () => {
    const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '/fixture/settings.json')))

    const proxies = foxyProxyConverter.convert(fixture)

    expect(proxies).to.be.an('array')
    expect(proxies.length).to.be.equal(4)
    proxies.forEach((result) => {
      expect(result.id).to.be.a('string')
      expect(result.type).to.be.a('string')
      expect(result.title).to.be.a('string')
      expect(result.host).to.be.a('string')
      expect(result.port).to.be.a('number')
      expect(result.username).to.be.a('string')
      expect(result.password).to.be.a('string')
    })
  })
})
