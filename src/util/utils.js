// @flow

import { bns, div, eq, gte, mul, toFixed } from 'biggystring'
import type { EdgeCurrencyInfo, EdgeCurrencyWallet, EdgeDenomination, EdgeMetaToken, EdgeReceiveAddress, EdgeTransaction } from 'edge-core-js'
import _ from 'lodash'
import { Platform } from 'react-native'
import parse from 'url-parse'

import { FIAT_CODES_SYMBOLS, getSymbolFromCurrency } from '../constants/indexConstants.js'
import { intl } from '../locales/intl.js'
import { convertCurrency } from '../modules/UI/selectors.js'
import type { State } from '../types/reduxTypes.js'
import type { CustomTokenInfo, ExchangeData, GuiDenomination, GuiWallet } from '../types/types.js'

export const DIVIDE_PRECISION = 18

export const cutOffText = (str: string, lng: number) => {
  if (str.length >= lng) {
    return str.slice(0, lng) + '...'
  } else {
    return str
  }
}

export const findDenominationSymbol = (denoms: Array<EdgeDenomination>, value: string) => {
  for (const v of denoms) {
    if (v.name === value) {
      return v.symbol
    }
  }
}

export const getSettingsCurrencyMultiplier = (currencyCode: string, settings: Object, denominations: Object) => {
  const setCurrencyDenomination = settings[currencyCode].denomination
  const denominationsInfo = denominations[setCurrencyDenomination]
  const multiplier = denominationsInfo.multiplier
  return multiplier
}

// tokens can only have one denomination / multiplier from what I understand
export const getSettingsTokenMultiplier = (currencyCode: string, settings: Object, denomination: Object): string => {
  let multiplier
  if (denomination) {
    multiplier = denomination[settings[currencyCode].denomination].multiplier
  } else {
    const customDenom = _.find(settings.customTokens, item => item.currencyCode === currencyCode)
    if (customDenom && customDenom.denominations && customDenom.denominations[0]) {
      multiplier = customDenom.denominations[0].multiplier
    } else {
      return '1'
    }
  }
  return multiplier
}

export const getWalletDefaultDenomProps = (wallet: Object, settingsState: Object, currencyCode?: string /* for metaTokens */): EdgeDenomination => {
  const allWalletDenoms = wallet.allDenominations
  let walletCurrencyCode
  if (currencyCode) {
    // if metaToken
    walletCurrencyCode = currencyCode
  } else {
    // if not a metaToken
    walletCurrencyCode = wallet.currencyCode
  }
  const currencySettings = settingsState[walletCurrencyCode] // includes 'denomination', currencyName, and currencyCode
  let denomProperties: EdgeDenomination
  if (allWalletDenoms[walletCurrencyCode] != null && allWalletDenoms[walletCurrencyCode][currencySettings.denomination] != null) {
    denomProperties = allWalletDenoms[walletCurrencyCode][currencySettings.denomination] // includes name, multiplier, and symbol
  } else {
    // This is likely a custom token which has no denom setup in allWalletDenominations
    denomProperties = currencySettings.denominations[0]
  }
  return denomProperties
}

export const getFiatSymbol = (code: string) => {
  code = code.replace('iso:', '')
  return getSymbolFromCurrency(code)
}

export const logInfo = (msg: string) => {
  console.log('%c ' + msg, 'background: grey; font-weight: bold; display: block;')
}

export const logWarning = (msg: string) => {
  console.log('%c ' + msg, 'background: yellow; font-weight: bold; display: block;')
}

export const logError = (msg: string) => {
  console.log('%c ' + msg, 'background: red; font-weight: bold; display: block;')
}

export const inputBottomPadding = () => {
  if (Platform.OS === 'android') {
    return {
      paddingBottom: 0
    }
  }
}

// will take the metaTokens property on the wallet (that comes from currencyInfo), merge with account-level custom tokens added, and only return if enabled (wallet-specific)
// $FlowFixMe
export const mergeTokens = (preferredEdgeMetaTokens: Array<$ReadOnly<EdgeMetaToken | CustomTokenInfo>>, edgeMetaTokens: Array<CustomTokenInfo>) => {
  const tokensEnabled = [...preferredEdgeMetaTokens] // initially set the array to currencyInfo (from plugin), since it takes priority
  for (const x of edgeMetaTokens) {
    // loops through the account-level array
    let found = false // assumes it is not present in the currencyInfo from plugin
    for (const val of tokensEnabled) {
      // loops through currencyInfo array to see if already present
      if (x.currencyCode === val.currencyCode) {
        found = true // if present, then set 'found' to true
      }
    }
    if (!found) tokensEnabled.push(x) // if not already in the currencyInfo, then add to tokensEnabled array
  }
  return tokensEnabled
}

export const mergeTokensRemoveInvisible = (preferredEdgeMetaTokens: Array<EdgeMetaToken>, edgeMetaTokens: Array<CustomTokenInfo>): Array<EdgeMetaToken> => {
  const tokensEnabled: Array<EdgeMetaToken> = [...preferredEdgeMetaTokens] // initially set the array to currencyInfo (from plugin), since it takes priority
  const tokensToAdd = []
  for (const x of edgeMetaTokens) {
    // loops through the account-level array
    if (x.isVisible !== false && _.findIndex(tokensEnabled, walletToken => walletToken.currencyCode === x.currencyCode) === -1) {
      tokensToAdd.push(x)
    }
  }

  // $FlowFixMe this is actually an error, but I don't know how to fix it:
  return tokensEnabled.concat(tokensToAdd)
}

// Used to reject non-numeric (expect '.') values in the FlipInput
export const isValidInput = (input: string): boolean =>
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Unary_plus_()
  !isNaN(+input) || input === '.'

// Used to limit the decimals of a displayAmount
// TODO every function that calls this function needs to be flowed
export const truncateDecimals = (input: string, precision: number, allowBlank: boolean = false): string => {
  if (input === '') {
    if (allowBlank) {
      input = ''
    } else {
      input = '0'
    }
  }
  if (!input.includes('.')) {
    return input
  }
  const [integers, decimals] = input.split('.')
  return precision > 0 ? `${integers}.${decimals.slice(0, precision)}` : integers
}

/**
 * @deprecated
 * @param input
 * @returns {string}
 */
export const formatNumber = (input: string): string => {
  let out = input.replace(/^0+/, '')
  if (out.startsWith('.')) {
    out = '0' + out
  }
  return out
}

export const decimalOrZero = (input: string, decimalPlaces: number): string => {
  if (gte(input, '1')) {
    // do nothing to numbers greater than one
    return input
  } else {
    const truncatedToDecimals = toFixed(input, decimalPlaces, decimalPlaces)
    if (eq(truncatedToDecimals, '0')) {
      // cut off to number of decimal places equivalent to zero?
      return '0' // then return zero
    } else {
      // if not equivalent to zero
      return truncatedToDecimals.replace(/0+$/, '') // then return the truncation
    }
  }
}

// Used to convert outputs from core into other denominations (exchangeDenomination, displayDenomination)
export const convertNativeToDenomination = (nativeToTargetRatio: string) => (nativeAmount: string): string =>
  div(nativeAmount, nativeToTargetRatio, DIVIDE_PRECISION)

// Alias for convertNativeToDenomination
// Used to convert outputs from core to amounts ready for display
export const convertNativeToDisplay = convertNativeToDenomination
// Alias for convertNativeToDenomination
// Used to convert outputs from core to amounts ready for display
export const convertNativeToExchange = convertNativeToDenomination

// Used to convert amounts from display to core inputs
export const convertDisplayToNative = (nativeToDisplayRatio: string) => (displayAmount: string): string =>
  !displayAmount ? '' : mul(displayAmount, nativeToDisplayRatio)

export const isCryptoParentCurrency = (wallet: GuiWallet, currencyCode: string) => currencyCode === wallet.currencyCode

export function getNewArrayWithoutItem<T> (array: Array<T>, targetItem: T): Array<T> {
  return array.filter(item => item !== targetItem)
}

export const getNewArrayWithItem = (array: Array<any>, item: any) => (!array.includes(item) ? [...array, item] : array)

const restrictedCurrencyCodes = ['BTC']

export function getDenomFromIsoCode (currencyCode: string): GuiDenomination {
  if (restrictedCurrencyCodes.findIndex(item => item === currencyCode) !== -1) {
    return {
      name: '',
      symbol: '',
      multiplier: '0'
    }
  }
  const symbol = getSymbolFromCurrency(currencyCode)
  const denom: GuiDenomination = {
    name: currencyCode,
    symbol,
    multiplier: '100'
  }
  return denom
}

export function getAllDenomsOfIsoCurrencies (): Array<GuiDenomination> {
  // Convert map to an array
  const denomArray = []

  for (const currencyCode in FIAT_CODES_SYMBOLS) {
    if (FIAT_CODES_SYMBOLS.hasOwnProperty(currencyCode)) {
      const item = getDenomFromIsoCode(currencyCode)
      if (item.name.length) {
        denomArray.push(item)
      }
    }
  }
  return denomArray
}

export const getSupportedFiats = (defaultCurrencyCode?: string): Array<{ label: string, value: string }> => {
  const out = []
  if (defaultCurrencyCode && FIAT_CODES_SYMBOLS[defaultCurrencyCode]) {
    out.push({
      label: `${defaultCurrencyCode} - ${FIAT_CODES_SYMBOLS[defaultCurrencyCode]}`,
      value: defaultCurrencyCode
    })
  }
  for (const currencyCode in FIAT_CODES_SYMBOLS) {
    if (defaultCurrencyCode === currencyCode) {
      continue
    }
    if (FIAT_CODES_SYMBOLS.hasOwnProperty(currencyCode)) {
      out.push({
        label: `${currencyCode} - ${FIAT_CODES_SYMBOLS[currencyCode]}`,
        value: currencyCode
      })
    }
  }
  return out
}

/**
 * Adds the `iso:` prefix to a currency code, if it's missing.
 * @param {*} currencyCode A currency code we believe to be a fiat value.
 */
export function fixFiatCurrencyCode (currencyCode: string) {
  // These are included in the currency-symbol-map library,
  // and therefore might sneak into contexts where we expect fiat codes:
  if (currencyCode === 'BTC' || currencyCode === 'ETH') return currencyCode

  return /^iso:/.test(currencyCode) ? currencyCode : 'iso:' + currencyCode
}

export const isCompleteExchangeData = (exchangeData: ExchangeData) =>
  !!exchangeData.primaryDisplayAmount &&
  !!exchangeData.primaryDisplayName &&
  !!exchangeData.secondaryDisplayAmount &&
  !!exchangeData.secondaryDisplaySymbol &&
  !!exchangeData.secondaryCurrencyCode

export const unspacedLowercase = (input: string) => {
  const newInput = input.replace(' ', '').toLowerCase()
  return newInput
}

export const getCurrencyInfo = (allCurrencyInfos: Array<EdgeCurrencyInfo>, currencyCode: string): EdgeCurrencyInfo | void => {
  for (const info of allCurrencyInfos) {
    for (const denomination of info.denominations) {
      if (denomination.name === currencyCode) {
        return info
      }
    }
  }
  // loop through metaTokens only after all top-level / parent
  // cryptos have been looped through. Native / parent currency
  // takes precedence over tokens
  for (const info of allCurrencyInfos) {
    for (const token of info.metaTokens) {
      for (const denomination of token.denominations) {
        if (denomination.name === currencyCode) {
          return info
        }
      }
    }
  }
  return void 0
}

export const denominationToDecimalPlaces = (denomination: string): string => {
  const numberOfDecimalPlaces = (denomination.match(/0/g) || []).length
  const decimalPlaces = numberOfDecimalPlaces.toString()
  return decimalPlaces
}

export const decimalPlacesToDenomination = (decimalPlaces: string): string => {
  const numberOfDecimalPlaces: number = parseInt(decimalPlaces)
  const denomination: string = '1' + '0'.repeat(numberOfDecimalPlaces)

  // will return, '1' at the very least
  return denomination
}

export const isReceivedTransaction = (edgeTransaction: EdgeTransaction): boolean => {
  return !isSentTransaction(edgeTransaction)
}
export const isSentTransaction = (edgeTransaction: EdgeTransaction): boolean => {
  return !!edgeTransaction.nativeAmount && edgeTransaction.nativeAmount.charAt(0) === '-'
}

export type PrecisionAdjustParams = {
  exchangeSecondaryToPrimaryRatio: number,
  secondaryExchangeMultiplier: string,
  primaryExchangeMultiplier: string
}

export function precisionAdjust (params: PrecisionAdjustParams): number {
  const order = Math.floor(Math.log(params.exchangeSecondaryToPrimaryRatio) / Math.LN10 + 0.000000001) // because float math sucks like that
  const exchangeRateOrderOfMagnitude = Math.pow(10, order)

  // Get the exchange rate in pennies
  const exchangeRateString = bns.mul(exchangeRateOrderOfMagnitude.toString(), params.secondaryExchangeMultiplier)

  const precisionAdjust = bns.div(exchangeRateString, params.primaryExchangeMultiplier, DIVIDE_PRECISION)

  if (bns.lt(precisionAdjust, '1')) {
    const fPrecisionAdject = parseFloat(precisionAdjust)
    let order = 2 + Math.floor(Math.log(fPrecisionAdject) / Math.LN10 - 0.000000001) // because float math sucks like that
    order = Math.abs(order)
    if (order > 0) {
      return order
    }
  }
  return 0
}

export const noOp = (optionalArgument: any = null) => {
  return optionalArgument
}

export const getReceiveAddresses = (currencyWallets: { [id: string]: EdgeCurrencyWallet }): Promise<{ [id: string]: EdgeReceiveAddress }> => {
  const ids = Object.keys(currencyWallets)
  const promises = ids.map(id => {
    return currencyWallets[id].getReceiveAddress()
  })
  return Promise.all(promises).then(receiveAddresses => {
    return ids.reduce((result, id, index) => {
      return {
        ...result,
        [id]: receiveAddresses[index]
      }
    }, {})
  })
}

export const MILLISECONDS_PER_DAY = 86400000
export const daysBetween = (DateInMsA: number, dateInMsB: number) => {
  const msBetween = dateInMsB - DateInMsA
  const daysBetween = msBetween / MILLISECONDS_PER_DAY
  return daysBetween
}

// Does a shallow compare of obj1 to obj2 and returns the element name of the element which differs
// between the two. Will recursively deep compare any unequal elements specified in traverseObjects.
// Returns the element name of the unequal element or '' if objects are equal
export function getObjectDiff (obj1: Object, obj2: Object, traverseObjects?: Object, ignoreObjects?: Object): string {
  const comparedElements = {}
  for (const e in obj1) {
    if (ignoreObjects && ignoreObjects[e]) {
      continue
    }
    comparedElements[e] = true
    if (obj1.hasOwnProperty(e)) {
      if (obj2.hasOwnProperty(e)) {
        if (obj1[e] !== obj2[e]) {
          if (traverseObjects && traverseObjects[e] && typeof obj1[e] === 'object') {
            const deepDiff = getObjectDiff(obj1[e], obj2[e], traverseObjects, ignoreObjects)
            if (deepDiff) {
              // console.log(`getObjectDiff:${e}`)
              return e
            }
          } else {
            // console.log(`getObjectDiff:${e}`)
            return e
          }
        }
      } else {
        // console.log(`getObjectDiff:${e}`)
        return e
      }
    }
  }
  for (const e in obj2) {
    if ((comparedElements && comparedElements[e]) || (ignoreObjects && ignoreObjects[e])) {
      continue
    }
    if (obj2.hasOwnProperty(e)) {
      if (obj1.hasOwnProperty(e)) {
        if (obj1[e] !== obj2[e]) {
          if (traverseObjects && traverseObjects[e] && typeof obj1[e] === 'object') {
            const deepDiff = getObjectDiff(obj2[e], obj1[e], traverseObjects)
            if (deepDiff) {
              return e
            }
          } else {
            return e
          }
        }
      } else {
        return e
      }
    }
  }
  return ''
}

export function runWithTimeout<T> (promise: Promise<T>, ms: number, error: Error = new Error(`Timeout of ${ms}ms exceeded`)): Promise<T> {
  const timeout = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(error), ms)
    const onDone = () => clearTimeout(timer)
    promise.then(onDone, onDone)
  })
  return Promise.race([promise, timeout])
}

export function snooze (ms: number): Promise<void> {
  return new Promise((resolve: any) => setTimeout(resolve, ms))
}

const MyEdgeLoginProtocols = {
  'edge:': true,
  'edge-ret:': true,
  'airbitz:': true,
  'airbitz-ret:': true,
  'https:': true
}

export const isEdgeLogin = (data: string) => {
  const parsedUrl = parse(data, {}, false)
  if (MyEdgeLoginProtocols[parsedUrl.protocol]) {
    if (parsedUrl.host === 'edge') {
      if (typeof parsedUrl.pathname === 'string') {
        if (parsedUrl.pathname.length > 11) {
          return true
        }
      }
    }
    if (parsedUrl.hostname === 'www.edge.app' && parsedUrl.pathname === '/edgelogin') {
      return true
    }
  }
  return false
}

const REQUEST_CURRENCIES = {
  bitcoin: true,
  dash: true,
  bitcoincash: true
}

export type RequestPaymentAddress = {
  sourceName: string,
  currencyName: string,
  callbackUrl: string,
  callbackDomain: string
}

export const getRequestForAddress = (data: string): RequestPaymentAddress => {
  const parsedUrl = parse(data, {}, true)
  if (typeof parsedUrl.protocol !== 'string') throw new Error('InvalidRequestForAddress')
  if (typeof parsedUrl.pathname !== 'string') throw new Error('InvalidRequestForAddress')
  if (parsedUrl.host !== 'x-callback-url') throw new Error('InvalidRequestForAddress')
  let currencyName = ''
  parsedUrl.protocol = parsedUrl.protocol.replace(':', '')
  if (parsedUrl.protocol === 'edge-ret' || parsedUrl.protocol === 'airbitz-ret' || parsedUrl.protocol === 'edge' || parsedUrl.protocol === 'airbitz') {
    // Get currency from the pathname of format 'request-litecoin-address'
    let pathname = parsedUrl.pathname.replace('/request-', '')
    pathname = pathname.replace('-address', '')
    if (pathname.length) {
      if (REQUEST_CURRENCIES[pathname] === true) {
        currencyName = pathname
      }
    }
  } else {
    for (const curr in REQUEST_CURRENCIES) {
      if (curr + '-ret' === parsedUrl.protocol) {
        currencyName = curr
        break
      }
    }
  }
  // Get source and url
  if (!currencyName || !parsedUrl.query['x-success'] || !parsedUrl.query['x-source']) {
    throw new Error('InvalidRequestForAddress')
  }
  const callbackUrl = parsedUrl.query['x-success']
  const sourceName = parsedUrl.query['x-source']
  const parsedCallbackUrl = parse(callbackUrl)
  const callbackDomain = parsedCallbackUrl.host
  return { sourceName, currencyName, callbackUrl, callbackDomain }
}

export const getTotalFiatAmountFromExchangeRates = (state: State, isoFiatCurrencyCode: string) => {
  const temporaryTotalCrypto = {}
  const wallets = state.ui.wallets.byId
  const settings = state.ui.settings
  // loop through each of the walletId's
  for (const parentProp in wallets) {
    const wallet = wallets[parentProp]
    // loop through all of the nativeBalances, which includes both parent currency and tokens
    for (const currencyCode in wallet.nativeBalances) {
      // if there is no native balance for the currency / token then assume it's zero
      if (!temporaryTotalCrypto[currencyCode]) {
        temporaryTotalCrypto[currencyCode] = 0
      }

      // get the native balance for this currency
      const nativeBalance = wallet.nativeBalances[currencyCode]
      // if it's a token and not enabled
      const isDisabledToken = currencyCode !== wallet.currencyCode && !wallet.enabledTokens.includes(currencyCode)
      if (isDisabledToken) continue
      // if it is a non-zero amount then we will process it
      if (nativeBalance && nativeBalance !== '0') {
        let denominations
        // check to see if it's a currency first
        if (settings[currencyCode]) {
          // and if so then grab the default denomiation (setting)
          denominations = settings[currencyCode].denominations
        } else {
          // otherwise find the token whose currencyCode matches the one that we are working with
          const tokenInfo = settings.customTokens.find(token => token.currencyCode === currencyCode)
          // grab the denominations array (which is equivalent of the denominations from the previous (true) clause)
          if (!tokenInfo) continue
          denominations = tokenInfo.denominations
        }
        // now go through that array of denominations and find the one whose name matches the currency
        const exchangeDenomination = denominations.find(denomination => denomination.name === currencyCode)
        if (!exchangeDenomination) continue
        // grab the multiplier, which is the ratio that we can multiply and divide by
        const nativeToExchangeRatio: string = exchangeDenomination.multiplier
        // divide the native amount (eg satoshis) by the ratio to end up with standard crypto amount (which exchanges use)
        const cryptoAmount: number = parseFloat(convertNativeToExchange(nativeToExchangeRatio)(nativeBalance))
        temporaryTotalCrypto[currencyCode] = temporaryTotalCrypto[currencyCode] + cryptoAmount
      }
    }
  }
  const balanceInfo = calculateTotalFiatBalance(state, temporaryTotalCrypto, isoFiatCurrencyCode)
  return balanceInfo
}

export const calculateTotalFiatBalance = (state: State, values: { [string]: number }, isoFiatCurrencyCode: string) => {
  let total = 0
  // if calculating total balance for password recovery reminder, then use iso:USD that was passed in
  // otherwise grab the default from the account
  const isoFiat = isoFiatCurrencyCode
  for (const currency in values) {
    const addValue = convertCurrency(state, currency, isoFiat, values[currency])
    total = total + addValue
  }
  return intl.formatNumber(total, { toFixed: 2 })
}

export const isTooFarAhead = (dateInSeconds: number, currentDateInSeconds: number) => {
  const secondsPerDay = 86400
  const daysPerMonth = 30
  const monthInFuture = currentDateInSeconds + secondsPerDay * daysPerMonth
  return dateInSeconds > monthInFuture
}

export const isTooFarBehind = (dateInSeconds: number) => {
  const dateOfBitcoinGenesisInSeconds = 1230940800 // 2009-01-03T00:00:00.000Z
  return dateInSeconds < dateOfBitcoinGenesisInSeconds
}

export const autoCorrectDate = (dateInSeconds: number, currentDateInSeconds: number = msToSeconds(Date.now())) => {
  if (isTooFarAhead(dateInSeconds, currentDateInSeconds)) return dateInSeconds / 1000
  if (isTooFarBehind(dateInSeconds)) return dateInSeconds * 1000
  return dateInSeconds
}

export const secondsToMs = (dateInSeconds: number) => {
  const msPerSecond = 1000
  return dateInSeconds * msPerSecond
}

export const msToSeconds = (dateInMs: number) => {
  const msPerSecond = 1000
  return dateInMs / msPerSecond
}

// Strips special characters and replaces spaces with hyphens
export const sanitizeForFilename = (s: string) => {
  const charRegex = /[^\w\s-]/g
  const hyphenRegex = /[-\s]+/g

  s = s.replace(charRegex, '').trim()
  s = s.replace(hyphenRegex, '-')

  return s
}

export const getYesterdayDateRoundDownHour = () => {
  const date = new Date()
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  const yesterday = date.setDate(date.getDate() - 1)
  return new Date(yesterday).toISOString()
}
