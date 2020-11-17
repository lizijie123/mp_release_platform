require('@babel/register')({
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: "usage",
        corejs: 3
      }
    ]
  ]
})

global.__CLIENT__ = false
global.__SERVER__ = true
global.__DEVELOPMENT__ = process.env.NODE_ENV === 'development'
global.__PRODUCTION__ = process.env.NODE_ENV === 'production'

process.env.HTTPPORT = process.env.HTTPPORT ? Number.parseInt(process.env.HTTPPORT) : 8088
process.env.HTTPSPORT = process.env.HTTPSPORT ? Number.parseInt(process.env.HTTPSPORT) : 8089
process.env.KEEP_ALIVE_TIMEOUT = process.env.KEEP_ALIVE_TIMEOUT || 10 * 1000

require('./server.ts')
