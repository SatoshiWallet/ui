// @flow

import {
  type EdgeDenomination,
  type EdgeMetadata,
  type EdgeMetaToken,
  type EdgeReceiveAddress,
  type EdgeSwapQuote,
  type EdgeSwapRequest,
  type EdgeTransaction
} from 'edge-core-js/types'

import { type State } from './reduxTypes.js'

export type GuiWallet = {
  id: string,
  type: string,
  name: string,
  primaryNativeBalance: string,
  nativeBalances: { [currencyCode: string]: string },
  currencyNames: { [currencyCode: string]: string },
  currencyCode: string,
  isoFiatCurrencyCode: string,
  fiatCurrencyCode: string,
  denominations: Array<EdgeDenomination>,
  allDenominations: { [currencyCode: string]: { [denomination: string]: EdgeDenomination } },
  symbolImage: string | void,
  symbolImageDarkMono: string | void,
  metaTokens: Array<EdgeMetaToken>,
  enabledTokens: Array<string>,
  receiveAddress: EdgeReceiveAddress,
  addressLoadingProgress?: number,
  blockHeight: number | null
}

export type GuiDenomination = EdgeDenomination
export type GuiCurrencyInfo = {
  displayCurrencyCode: string,
  exchangeCurrencyCode: string,
  displayDenomination: GuiDenomination,
  exchangeDenomination: GuiDenomination
}

export type GuiContact = {
  hasThumbnail: boolean,
  emailAddresses: Array<string>,
  postalAddresses: Array<string>,
  middleName: string,
  company: string,
  jobTitle: string,
  familyName: string,
  thumbnailPath: string,
  recordID: string,
  givenName: string
}

/**
 * An EdgeSwapQuote, but with amounts pretty-printed.
 */
export type GuiSwapInfo = {
  quote: EdgeSwapQuote,
  request: EdgeSwapRequest,

  // Formatted amounts:
  fee: string,
  fromDisplayAmount: string,
  fromFiat: string,
  toDisplayAmount: string,
  toFiat: string
}

export type ExchangeData = {
  primaryDisplayAmount: string,
  primaryDisplayName: string,
  secondaryDisplayAmount: string,
  secondaryDisplaySymbol: string,
  secondaryCurrencyCode: string
}

export type CustomTokenInfo = {
  currencyName: string,
  currencyCode: string,
  contractAddress: string,
  multiplier: string,
  denomination: string, // eventually change to mandatory
  isVisible?: boolean, // eventually change to mandatory,
  denominations: Array<EdgeDenomination>,
  walletType?: string
}

export type GuiWalletType = {
  label: string,
  value: string,
  symbolImage?: string,
  symbolImageDarkMono?: string,
  currencyCode: string
}
export type CustomNodeSetting = {
  isEnabled: boolean,
  nodesList: Array<string>
}
export type CurrencySetting = {
  denomination: string
}

export type GuiFiatType = {
  label: string,
  value: string
}

export type TransactionListTx = {
  ...EdgeTransaction,
  dateString?: string,
  key: number,
  time: string,
  unfilteredIndex: number
}

export type FlatListItem = {
  key: number,
  item: any
}

export type DeviceDimensions = {
  keyboardHeight: number
}

export type GuiTouchIdInfo = {
  isTouchEnabled: boolean,
  isTouchSupported: boolean
}

export type GuiReceiveAddress = {
  metadata: EdgeMetadata,
  publicAddress: string,
  legacyAddress?: string,
  segwitAddress?: string,
  nativeAmount: string
}

export type FlipInputFieldInfo = GuiCurrencyInfo & {
  nativeAmount?: string,
  displayAmount?: string
}

export type SubcategorySearchResultData = {
  index: number,
  item: string,
  separators: Object
}

export type CurrencyConverter = {
  convertCurrency: (state: State, currencyCode: string, isoFiatCurrencyCode: string, balanceInCryptoDisplay: string) => number
}

export const emptyGuiWallet: GuiWallet = {
  id: '',
  type: '',
  name: '',
  primaryNativeBalance: '',
  nativeBalances: {},
  currencyNames: {},
  currencyCode: '',
  isoFiatCurrencyCode: '',
  fiatCurrencyCode: '',
  denominations: [],
  allDenominations: {},
  symbolImage: '',
  symbolImageDarkMono: '',
  metaTokens: [],
  enabledTokens: [],
  receiveAddress: {
    nativeAmount: '',
    metadata: {},
    publicAddress: '',
    legacyAddress: ''
  },
  addressLoadingProgress: 0,
  blockHeight: null
}

export const emptyGuiDenomination: GuiDenomination = {
  name: '',
  symbol: '',
  multiplier: '',
  precision: 0,
  currencyCode: ''
}
export const emptyCurrencyInfo: GuiCurrencyInfo = {
  displayCurrencyCode: '',
  exchangeCurrencyCode: '',
  displayDenomination: emptyGuiDenomination,
  exchangeDenomination: emptyGuiDenomination
}

export type PasswordReminder = {
  needsPasswordCheck: boolean,
  lastPasswordUseDate: number,
  passwordUseCount: number,
  nonPasswordLoginsCount: number,
  nonPasswordDaysLimit: number,
  nonPasswordLoginsLimit: number
}

export type SpendingLimits = {
  transaction: {
    isEnabled: boolean,
    amount: number
  }
}

export type PluginUrlMap = {
  pluginId: string,
  uri: string,
  name: string,
  supportEmail?: string,
  permissions?: Array<string>,
  originWhitelist?: Array<string>,
  isLegacy?: boolean
}

export type BuySellPlugin = {
  id: string,
  pluginId: string,
  priority: number,
  paymentType: string | { [string]: boolean },
  description: string,
  title: string,
  paymentTypeLogoKey: string,
  partnerIconPath: string,
  cryptoCodes?: Array<string>,
  countryCodes?: { [string]: boolean },
  forPlatform?: string,
  forCountries?: Array<string>,
  addOnUrl?: string // Optional suffix to add to plugin URI
}

export type CountryData = {
  name: string,
  'alpha-2': string,
  filename?: string
}

export type MostRecentWallet = {
  id: string,
  currencyCode: string
}
