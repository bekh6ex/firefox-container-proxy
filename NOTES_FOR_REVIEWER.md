#Notes for reviewer

##Proof of library code origin
```shell script
curl https://unpkg.com/punycode@2.1.1/punycode.js | md5
cat src/lib/punycode.js | md5
# Expected 05cf102fc465c7aef3107e144d3ba332
```

```shell script
curl https://unpkg.com/mithril@2.0.0-rc.6/mithril.js | md5
cat src/lib/sources/mithril-2.0.0-rc.6.js | md5
# Expected 2d675648d79f39b9a94c31b5a7a66aff
```
