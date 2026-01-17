// src/lib/paymongo.cjs
// This file must be CommonJS (.cjs extension) to properly handle the paymongo package
const Paymongo = require('paymongo')

function createPaymongoClient(secretKey) {
  return new Paymongo(secretKey)
}

module.exports = { createPaymongoClient }

