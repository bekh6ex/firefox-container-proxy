(() => {
  const script = document.createElement('script')
  script.src = '/background/index.js'
  script.type = 'module'
  document.body.append(script)
})()
