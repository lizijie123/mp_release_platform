global.__CLIENT__ = false
global.__SERVER__ = true
global.__DEVELOPMENT__ = process.env.NODE_ENV === 'development'
global.__PRODUCTION__ = process.env.NODE_ENV === 'production'

require('./server.ts')
