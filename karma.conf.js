const reporters = ['mocha']

module.exports = function (config) {
  config.set({
    singleRun: true,
    browsers: ['Firefox'],
    frameworks: ['mocha', 'chai'],
    reporters,

    files: [
      { pattern: 'src/**/*.js', type: 'module', included: false },
      { pattern: 'test/unit/*.test.js', type: 'module' },
    ],
    plugins: [
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-chai'
    ]
  })
}
