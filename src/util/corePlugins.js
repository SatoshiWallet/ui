// @flow

import ENV from '../../env.json'

// Shim old-format env.json files:
if (ENV.ETHEREUM_INIT == null && (ENV.ETHERSCAN_API_KEY || ENV.INFURA_PROJECT_ID)) {
  ENV.ETHEREUM_INIT = {
    // blockcypherApiKey: '...',
    etherscanApiKey: ENV.ETHERSCAN_API_KEY,
    infuraProjectId: ENV.INFURA_PROJECT_ID
  }
}

if (ENV.SHAPESHIFT_INIT == null && (ENV.SHAPESHIFT_API_KEY && ENV.SHAPESHIFT_CLIENT_ID && ENV.SHAPESHIFT_SECRET)) {
  ENV.SHAPESHIFT_INIT = {
    apiKey: ENV.SHAPESHIFT_API_KEY,
    clientId: ENV.SHAPESHIFT_CLIENT_ID,
    secret: ENV.SHAPESHIFT_SECRET
  }
}

if (ENV.CHANGE_NOW_INIT == null && ENV.CHANGE_NOW_API_KEY) {
  ENV.CHANGE_NOW_INIT = {
    apiKey: ENV.CHANGE_NOW_API_KEY
  }
}

export const currencyPlugins = {
  // edge-currency-accountbased:
  eos: true,
  ethereum: ENV.ETHEREUM_INIT,
  fio: true,
  stellar: true,
  ripple: true,
  tezos: true,
  binance: true,
  rsk: true,
  // edge-currency-bitcoin:
  bitcoin: true,
  bitcoincash: true,
  bitcoincashtestnet: false,
  bitcoingold: true,
  bitcoingoldtestnet: false,
  bitcoinsv: true,
  bitcointestnet: true,
  dash: true,
  digibyte: true,
  dogecoin: true,
  eboost: true,
  feathercoin: true,
  groestlcoin: true,
  litecoin: true,
  qtum: true,
  ravencoin: true,
  smartcash: true,
  ufo: true,
  vertcoin: true,
  zcoin: true,
  // edge-currency-monero:
  monero: ENV.MONERO_INIT
}

export const ratePlugins = {
  'shapeshift-rate': false,
  compound: true,
  coinbase: true,
  coincap: true,
  constantRate: true,
  coincapLegacy: false,
  nomics: ENV.NOMICS_INIT,
  currencyconverterapi: ENV.CURRENCYCONVERTERAPI_INIT,
  xagau: true
}

export const swapPlugins = {
  changelly: ENV.CHANGELLY_INIT,
  changenow: ENV.CHANGE_NOW_INIT,
  coinswitch: ENV.COINSWITCH_INIT,
  faast: ENV.FAAST_INIT,
  foxExchange: ENV.FOX_INIT,
  godex: ENV.GODEX_INIT,
  // shapeshift: ENV.SHAPESHIFT_INIT,
  totle: ENV.TOTLE_INIT
}

export const allPlugins = {
  ...currencyPlugins,
  ...ratePlugins,
  ...swapPlugins
}
