// @flow

import type { EdgeCurrencyInfo, EdgeDenomination } from 'edge-core-js'
import _ from 'lodash'

import * as Constants from '../../constants/indexConstants.js'
import { CORE_DEFAULTS, LOCAL_ACCOUNT_DEFAULTS, SYNCED_ACCOUNT_DEFAULTS } from '../../modules/Core/Account/settings.js'
import type { Action } from '../../types/reduxTypes.js'
import type { CustomTokenInfo, MostRecentWallet } from '../../types/types.js'
import { spendingLimits } from '../SpendingLimitsReducer.js'

export const initialState = {
  ...SYNCED_ACCOUNT_DEFAULTS,
  ...LOCAL_ACCOUNT_DEFAULTS,
  ...CORE_DEFAULTS,
  changesLocked: true,
  plugins: {
    allCurrencyInfos: [],
    supportedWalletTypes: []
  },
  pinLoginEnabled: false,
  account: null,
  loginStatus: null,
  isTouchSupported: false,
  isTouchEnabled: false,
  isOtpEnabled: false,
  otpKey: null,
  otpResetDate: null,
  otpResetPending: false,
  confirmPasswordError: '',
  sendLogsStatus: Constants.REQUEST_STATUS.PENDING,
  isAccountBalanceVisible: true,
  mostRecentWallets: [],
  spendingLimits: {
    transaction: {
      isEnabled: false,
      amount: 0
    }
  },
  developerModeOn: false
}

export type CurrencySetting = {
  denomination: string,
  denominations?: Array<EdgeDenomination>
}

export type SettingsState = {
  BCH: CurrencySetting,
  BTC: CurrencySetting,
  DASH: CurrencySetting,
  FTC: CurrencySetting,
  RVN: CurrencySetting,
  ETH: CurrencySetting,
  LTC: CurrencySetting,
  VTC: CurrencySetting,
  XZC: CurrencySetting,
  QTUM: CurrencySetting,
  UFO: CurrencySetting,
  XMR: CurrencySetting,
  XRP: CurrencySetting,
  REP: CurrencySetting,
  DOGE: CurrencySetting,
  DGB: CurrencySetting,
  WINGS: CurrencySetting,
  HERC: CurrencySetting,
  AGLD: CurrencySetting,

  account: ?Object,
  autoLogoutTimeInSeconds: number,
  bluetoothMode: boolean,
  changesLocked: any,
  customTokens: Array<CustomTokenInfo>,
  defaultFiat: string,
  defaultIsoFiat: string,
  isOtpEnabled: boolean,
  isTouchEnabled: boolean,
  countryCode: string,
  isTouchSupported: boolean,
  loginStatus: boolean | null,
  merchantMode: boolean,
  preferredSwapPluginId: string | void,
  otpKey: string | null,
  otpResetPending: boolean,
  otpMode: boolean,
  pinMode: boolean,
  pinLoginEnabled: boolean,
  otpResetDate: ?string,
  plugins: {
    [pluginName: string]: EdgeCurrencyInfo,
    allCurrencyInfos: Array<EdgeCurrencyInfo>,
    supportedWalletTypes: Array<string>
  },
  confirmPasswordError: string,
  sendLogsStatus: string,
  isAccountBalanceVisible: boolean,
  mostRecentWallets: Array<MostRecentWallet>,
  spendingLimits: {
    transaction: {
      isEnabled: boolean,
      amount: number
    }
  },
  developerModeOn: boolean,
  passwordRecoveryRemindersShown: {
    '20': boolean,
    '200': boolean,
    '2000': boolean,
    '20000': boolean,
    '200000': boolean
  }
}

const currencyPLuginUtil = (state, payloadData): SettingsState => {
  const { plugins } = state
  const { supportedWalletTypes } = plugins
  const { allCurrencyInfos } = plugins
  const { currencyInfo } = payloadData
  const { pluginName, walletType } = currencyInfo

  // Build up object with all the information for the parent currency, accesible by the currencyCode
  const defaultParentCurrencyInfo = state[currencyInfo.currencyCode]
  const parentCurrencyInfo = {
    [currencyInfo.currencyCode]: {
      ...defaultParentCurrencyInfo,
      displayName: currencyInfo.displayName,
      currencyCode: currencyInfo.currencyCode,
      denominations: currencyInfo.denominations,
      symbolImage: currencyInfo.symbolImage,
      symbolImageDarkMono: currencyInfo.symbolImageDarkMono
    }
  }

  // Build up object with all the information for each metatoken, accessible by the token currencyCode
  const metatokenCurrencyInfos = currencyInfo.metaTokens.reduce((acc, metatoken) => {
    const defaultMetatokenInfo = state[metatoken.currencyCode]
    return {
      ...acc,
      [metatoken.currencyCode]: {
        ...defaultMetatokenInfo,
        displayName: metatoken.currencyName,
        currencyCode: metatoken.currencyCode,
        denominations: metatoken.denominations,
        symbolImage: metatoken.symbolImage,
        symbolImageDarkMono: metatoken.symbolImageDarkMono
      }
    }
  }, {})

  // Build up object with all the currency information for each currency supported by the plugin, accessible by the currencyCode
  const currencyInfos = {
    ...parentCurrencyInfo,
    ...metatokenCurrencyInfos
  }

  return {
    ...state,
    ...currencyInfos,
    plugins: {
      ...plugins,
      [pluginName]: currencyInfo,
      allCurrencyInfos: [...allCurrencyInfos, currencyInfo],
      supportedWalletTypes: [...supportedWalletTypes, walletType]
    }
  }
}

export const settingsLegacy = (state: SettingsState = initialState, action: Action) => {
  switch (action.type) {
    case 'ACCOUNT/LOGGED_IN': {
      if (!action.data) throw new Error('Invalid Action')

      // Setup default denominations for settings based on currencyInfo
      if (!action.data.currencyPlugins) return state
      const newState = { ...state }
      for (const plugin of action.data.currencyPlugins) {
        const currencyCode = plugin.currencyInfo.currencyCode
        if (!newState[currencyCode]) newState[currencyCode] = {}
        if (!newState[currencyCode].denomination) {
          newState[currencyCode].denomination = plugin.currencyInfo.denominations[0].multiplier
        }
        if (!newState[currencyCode].denominations) {
          newState[currencyCode].denominations = plugin.currencyInfo.denominations
        }
        for (const token of plugin.currencyInfo.metaTokens) {
          const tokenCode = token.currencyCode
          newState[tokenCode] = {
            denomination: token.denominations[0].multiplier,
            denominations: token.denominations
          }
        }
      }
      return newState
    }

    case 'ACCOUNT_INIT_COMPLETE': {
      if (!action.data) throw new Error('Invalid action')
      const {
        touchIdInfo,
        account,
        otpInfo,
        currencyPlugins,
        autoLogoutTimeInSeconds,
        defaultFiat,
        defaultIsoFiat,
        merchantMode,
        preferredSwapPluginId,
        countryCode,
        customTokens,
        bluetoothMode,
        pinMode,
        pinLoginEnabled,
        otpMode,
        denominationKeys,
        customTokensSettings,
        isAccountBalanceVisible,
        mostRecentWallets,
        passwordRecoveryRemindersShown,
        developerModeOn
      } = action.data
      let newState = {
        ...state,
        loginStatus: true,
        isOtpEnabled: otpInfo.enabled,
        otpKey: otpInfo.otpKey,
        otpResetPending: otpInfo.otpResetPending,
        autoLogoutTimeInSeconds,
        isTouchEnabled: touchIdInfo ? touchIdInfo.isTouchEnabled : false,
        isTouchSupported: touchIdInfo ? touchIdInfo.isTouchSupported : false,
        defaultFiat,
        defaultIsoFiat,
        merchantMode,
        preferredSwapPluginId: preferredSwapPluginId === '' ? undefined : preferredSwapPluginId,
        customTokens,
        countryCode,
        bluetoothMode,
        pinMode,
        pinLoginEnabled,
        otpMode,
        otpResetDate: account.otpResetDate,
        isAccountBalanceVisible,
        mostRecentWallets,
        passwordRecoveryRemindersShown,
        developerModeOn
      }
      denominationKeys.forEach(key => {
        const currencyCode = key.currencyCode
        const denomination = key.denominationKey
        const currencyState = newState[currencyCode]
        newState = {
          ...newState,
          [currencyCode]: {
            ...currencyState,
            denomination
          }
        }
      })
      currencyPlugins.forEach(key => {
        newState = currencyPLuginUtil(newState, key)
      })
      customTokensSettings.forEach(key => {
        const { currencyCode } = key
        newState = {
          ...newState,
          [currencyCode]: key,
          defaultIsoFiat: `iso:${defaultFiat}`
        }
      })
      return newState
    }
    case 'DEVELOPER_MODE_ON': {
      return { ...state, developerModeOn: true }
    }
    case 'DEVELOPER_MODE_OFF': {
      return { ...state, developerModeOn: false }
    }
    case 'SET_CONFIRM_PASSWORD_ERROR': {
      if (!action.data) throw new Error('Invalid action')
      const { confirmPasswordError } = action.data
      return {
        ...state,
        confirmPasswordError: confirmPasswordError
      }
    }

    case 'UI/SETTINGS/TOGGLE_PIN_LOGIN_ENABLED': {
      if (!action.data) throw new Error('Invalid action')
      const { pinLoginEnabled } = action.data
      return {
        ...state,
        pinLoginEnabled
      }
    }

    case 'UPDATE_EXISTING_TOKEN_SUCCESS': {
      const { tokenObj } = action.data
      const customTokenSettings = state.customTokens
      const newCustomTokenSettings = customTokenSettings.map(item => {
        if (item.currencyCode === tokenObj.currencyCode) return { ...item, ...tokenObj }
        return item
      })
      const updatedSettings = {
        ...state,
        [tokenObj.currencyCode]: {
          ...state[tokenObj.currencyCode],
          ...tokenObj
        },
        customTokens: newCustomTokenSettings
      }
      return updatedSettings
    }

    case 'OVERWRITE_THEN_DELETE_TOKEN_SUCCESS': {
      // where oldCurrencyCode is the sender, and tokenObj.currencyCode is the receiver (new code)

      if (!action.data) throw new Error('Invalid action')
      const receiverCode = action.data.tokenObj.currencyCode
      const senderCode = action.data.oldCurrencyCode
      const { tokenObj } = action.data
      const customTokenSettings = state.customTokens
      const tokenSettingsWithUpdatedToken = customTokenSettings.map(item => {
        // overwrite receiver token
        if (item.currencyCode === receiverCode) return { ...item, ...tokenObj, isVisible: true }
        return item
      })
      const tokenSettingsWithUpdatedAndDeleted = tokenSettingsWithUpdatedToken.map(item => {
        // make sender token invisible
        if (item.currencyCode === senderCode) return { ...item, isVisible: false }
        return item
      })
      const updatedSettings = {
        ...state,
        [receiverCode]: {
          ...state[receiverCode],
          ...tokenObj,
          isVisible: true
        },
        [senderCode]: {
          ...state[senderCode],
          isVisible: false
        },
        customTokens: tokenSettingsWithUpdatedAndDeleted
      }
      return updatedSettings
    }

    case 'DELETE_CUSTOM_TOKEN_SUCCESS': {
      const { currencyCode } = action.data
      const customTokenSettings = state.customTokens
      const newCustomTokenSettings = customTokenSettings.map(item => {
        if (item.currencyCode === currencyCode) return { ...item, isVisible: false }
        return item
      })
      return {
        ...state,
        [currencyCode]: {
          ...state[currencyCode],
          isVisible: false
        },
        customTokens: newCustomTokenSettings
      }
    }

    case 'ADD_NEW_CUSTOM_TOKEN_SUCCESS': {
      if (!action.data) throw new Error('Invalid action')
      const { tokenObj, settings } = action.data
      const newCurrencyCode = tokenObj.currencyCode
      const customTokens = settings.customTokens
      return {
        ...state,
        [newCurrencyCode]: tokenObj,
        customTokens
      }
    }

    case 'ADD_NEW_TOKEN_THEN_DELETE_OLD_SUCCESS': {
      const { tokenObj, code, setSettings, oldCurrencyCode } = action.data
      const customTokens = setSettings.customTokens
      const oldCurrencyCodeIndex = _.findIndex(customTokens, item => item.currencyCode === oldCurrencyCode)
      customTokens[oldCurrencyCodeIndex] = {
        ...state.customTokens[oldCurrencyCodeIndex],
        isVisible: false
      }
      return {
        ...state,
        [code]: tokenObj,
        [oldCurrencyCode]: {
          ...state[oldCurrencyCode],
          isVisible: false
        },
        customTokens
      }
    }

    case 'UI/SETTINGS/SET_DENOMINATION_KEY': {
      if (!action.data) throw new Error('Invalid action')
      const currencyCode = action.data.currencyCode
      const denomination = action.data.denominationKey
      const currencyState = state[currencyCode]
      return {
        ...state,
        [currencyCode]: {
          ...currencyState,
          denomination
        }
      }
    }

    case 'DISABLE_OTP_RESET': {
      return {
        ...state,
        otpResetDate: null,
        otpResetPending: false
      }
    }

    case 'UI/SETTINGS/UPDATE_SETTINGS': {
      if (!action.data) throw new Error('Invalid action')
      const { settings } = action.data
      return settings
    }

    case 'UI/SETTINGS/LOAD_SETTINGS': {
      if (!action.data) throw new Error('Invalid action')
      const { settings } = action.data
      return settings
    }

    case 'UI/SETTINGS/SET_PIN_MODE': {
      if (!action.data) throw new Error('Invalid action')
      const { pinMode } = action.data
      return {
        ...state,
        pinMode
      }
    }

    case 'UI/SETTINGS/SET_OTP_MODE': {
      if (!action.data) throw new Error('Invalid action')
      const { otpMode } = action.data
      return {
        ...state,
        otpMode
      }
    }

    case 'UI/SETTINGS/SET_AUTO_LOGOUT_TIME': {
      const { autoLogoutTimeInSeconds } = action.data
      return {
        ...state,
        autoLogoutTimeInSeconds
      }
    }

    case 'LOGS/SEND_LOGS_REQUEST': {
      return {
        ...state,
        sendLogsStatus: Constants.REQUEST_STATUS.LOADING
      }
    }

    case 'LOGS/SEND_LOGS_FAILURE': {
      return {
        ...state,
        sendLogsStatus: Constants.REQUEST_STATUS.FAILURE
      }
    }

    case 'LOGS/SEND_LOGS_SUCCESS': {
      return {
        ...state,
        sendLogsStatus: Constants.REQUEST_STATUS.SUCCESS
      }
    }

    case 'LOGS/SEND_LOGS_PENDING': {
      return {
        ...state,
        sendLogsStatus: Constants.REQUEST_STATUS.PENDING
      }
    }

    case 'UI/SETTINGS/SET_DEFAULT_FIAT': {
      if (!action.data) throw new Error('Invalid action')
      const { defaultFiat } = action.data
      return {
        ...state,
        defaultFiat,
        defaultIsoFiat: `iso:${defaultFiat}`
      }
    }

    case 'UI/SETTINGS/SET_MERCHANT_MODE': {
      if (!action.data) throw new Error('Invalid action')
      const { merchantMode } = action.data
      return {
        ...state,
        merchantMode
      }
    }

    case 'UI/SETTINGS/SET_PREFERRED_SWAP_PLUGIN': {
      const pluginId = action.data
      return { ...state, preferredSwapPluginId: pluginId }
    }

    case 'UI/SETTINGS/SET_BLUETOOTH_MODE': {
      if (!action.data) throw new Error('Invalid action')
      const { bluetoothMode } = action.data
      return {
        ...state,
        bluetoothMode
      }
    }

    case 'UI/SETTINGS/SET_SETTINGS_LOCK': {
      return {
        ...state,
        changesLocked: action.data
      }
    }

    case 'UI/SETTINGS/OTP_SETTINGS': {
      if (!action.data) throw new Error('Invalid action')
      return {
        ...state,
        isOtpEnabled: action.data.enabled,
        otpKey: action.data.otpKey,
        otpResetPending: action.data.otpResetPending
      }
    }

    case 'UI/SETTINGS/TOUCH_ID_SETTINGS': {
      if (action.data) {
        return {
          ...state,
          isTouchSupported: action.data.isTouchSupported,
          isTouchEnabled: action.data.isTouchEnabled
        }
      } else {
        return {
          ...state,
          isTouchSupported: false,
          isTouchEnabled: false
        }
      }
    }

    case 'UI/SETTINGS/CHANGE_TOUCH_ID_SETTINGS': {
      if (!action.data) throw new Error('Invalid action')
      return {
        ...state,
        isTouchEnabled: action.data.isTouchEnabled
      }
    }

    case 'UI/SETTINGS/SET_MOST_RECENT_WALLETS': {
      if (!action.data) throw new Error('Invalid action')
      return {
        ...state,
        mostRecentWallets: action.data.mostRecentWallets
      }
    }

    case 'UI/SETTINGS/SET_ACCOUNT_BALANCE_VISIBILITY': {
      if (!action.data) throw new Error('Invalid action')
      return {
        ...state,
        isAccountBalanceVisible: action.data.isAccountBalanceVisible
      }
    }

    case 'UPDATE_SHOW_PASSWORD_RECOVERY_REMINDER_MODAL': {
      if (!action.data) throw new Error('Invalid action')
      const { level, wasShown } = action.data
      return {
        ...state,
        passwordRecoveryRemindersShown: {
          ...state.passwordRecoveryRemindersShown,
          [level]: wasShown
        }
      }
    }
    default:
      return state
  }
}

export const settings = (state: SettingsState = initialState, action: Action) => {
  let result = state
  const legacy = settingsLegacy(state, action)

  if (legacy !== state) {
    result = legacy
  }

  const spendingLimitsObj = spendingLimits(state.spendingLimits, action)

  if (spendingLimitsObj !== state.spendingLimits) {
    result = {
      ...result,
      spendingLimits: spendingLimitsObj
    }
  }

  return result
}
