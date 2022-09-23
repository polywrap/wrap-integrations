
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./mock-polkadot-js-extension.cjs.production.min.js')
} else {
  module.exports = require('./mock-polkadot-js-extension.cjs.development.js')
}
