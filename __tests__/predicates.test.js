import { isNotEmpty, isIpV4Address, isIpV6Address, isDomainName } from '../src/options/predicates.js'

describe('isNotEmpty', () => {
  it('should return true for non-empty strings', () => {
    expect(isNotEmpty(' ')).toBe(true)
    expect(isNotEmpty('asd')).toBe(true)
  })
})

describe('isIpV4Address', () => {
  it('should return true for correct IP addresses', () => {
    expect(isIpV4Address('0.0.0.0')).toBe(true)
    expect(isIpV4Address('255.255.255.255')).toBe(true)
    expect(isIpV4Address('25.25.25.25')).toBe(true)
  })
  it('should return false for not an IPv4 address', () => {
    expect(isIpV4Address('google.com')).toBe(false)
    expect(isIpV4Address('asds')).toBe(false)
  })
})

describe('isIpV6Address', () => {

  const validIpv6Addresses = [
    '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    '2001:0DB8:85A3:0000:0000:8A2E:0370:7334',
    '2001:0Db8:85a3:0000:0000:8A2e:0370:7334',
    'fdfe:dcba:9876:ffff:fdc6:c46b:bb8f:7d4c',
    'fdc6:c46b:bb8f:7d4c:fdc6:c46b:bb8f:7d4c',
    'fdc6:c46b:bb8f:7d4c:0000:8a2e:0370:7334',
    'fe80:0000:0000:0000:0202:b3ff:fe1e:8329',
    'fe80:0:0:0:202:b3ff:fe1e:8329',
    'fe80::202:b3ff:fe1e:8329',
    '0:0:0:0:0:0:0:0',
    '::',
    '0::',
    '::0',
    '0::0',
    // IPv4 mapped to IPv6
    '2001:0db8:85a3:0000:0000:8a2e:0.0.0.0',
    '::0.0.0.0',
    '::255.255.255.255',
    '::123.45.67.178',
  ]
  validIpv6Addresses.forEach(address => {
    it(`should return true for correct IP address: ${address}`, () => {
      expect(isIpV6Address(address)).toBe(true)
    })
  })

  const invalidIpV6Addresses = [
    'z001:0db8:85a3:0000:0000:8a2e:0370:7334',
    'fe80',
    'fe80:8329',
    'fe80:::202:b3ff:fe1e:8329',
    'fe80::202:b3ff::fe1e:8329',
    // IPv4 mapped to IPv6
    '2001:0db8:85a3:0000:0000:8a2e:0370:0.0.0.0',
    '::0.0',
    '::0.0.0',
    '::256.0.0.0',
    '::0.256.0.0',
    '::0.0.256.0',
    '::0.0.0.256',
    'google.com',
  ]

  invalidIpV6Addresses.forEach(address => {
    it(`should return false for invalid IP address: ${address}`, () => {
      expect(isIpV6Address(address)).toBe(false)
    })
  })

  it('should return false for not an IPv6 address', () => {
    expect(isIpV6Address('google.com')).toBe(false)
    expect(isIpV6Address('asds')).toBe(false)
    expect(isIpV6Address('9.9.9.9')).toBe(false)
  })
})

describe('isDomainName', () => {
  const validDomainNames = [
    'a.pl',
    'www.example.com',
    'www.example.museum',
    'example.com',
    'examp_le.com',
    'www.sub_domain.examp_le.com',
    'www.example.coop',
    'very.long.domain.name.com',
    'localhost',
    'myhost123',
    'sãopaulo.com',
    'xn--sopaulo-xwa.com',
    'sãopaulo.com.br',
    'xn--sopaulo-xwa.com.br',
    'пример.испытание',
    'xn--e1afmkfd.xn--80akhbyknj4f',
    'مثال.إختبار',
    'xn--mgbh0fb.xn--kgbechtv',
    '例子.测试',
    'xn--fsqu00a.xn--0zwm56d',
    '例子.測試',
    'xn--fsqu00a.xn--g6w251d',
    '例え.テスト',
    'xn--r8jz45g.xn--zckzah',
    'مثال.آزمایشی',
    'xn--mgbh0fb.xn--hgbk6aj7f53bba',
    '실례.테스트',
    'xn--9n2bp8q.xn--9t4b11yi5a',
    'العربية.idn.icann.org',
    'xn--ogb.idn.icann.org',
    'xn--e1afmkfd.xn--80akhbyknj4f.xn--e1afmkfd',
    'xn--espaa-rta.xn--ca-ol-fsay5a',
    'xn--d1abbgf6aiiy.xn--p1ai',
    '☎.com',
  ]

  validDomainNames.forEach(domainName => {
    it(`${domainName}: valid - returns true`, () => {
      expect(isDomainName(domainName)).toBe(true)
    })
  })

  const invalidDomainNames = [
    'example.com::aa',
    'example.com:aa',
    '127.0.0.1:aa',
    '127.0.0.1:80',
    '::1',
    'hello.☎/',
    'www.example.com.',
    'exa mple.com',
  ]

  invalidDomainNames.forEach(domainName => {
    it(`should return false for invalid domain name: ${domainName}`, () => {
      expect(isDomainName(domainName)).toBe(false)
    })
  })
})
