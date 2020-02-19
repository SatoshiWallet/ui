// @flow

import { downgradeDisklet } from 'disklet'
import { createInputModal, createSecureTextModal, createYesNoModal } from 'edge-components'
import type { EdgeAccount } from 'edge-core-js'
import { disableTouchId, enableTouchId } from 'edge-login-ui-rn'
import React from 'react'
import { Image } from 'react-native'
import { Actions } from 'react-native-router-flux'
import IonIcon from 'react-native-vector-icons/Ionicons'

import iconImage from '../assets/images/otp/OTP-badge_sm.png'
import { launchModal } from '../components/common/ModalProvider.js'
import { showError, showToast } from '../components/services/AirshipInstance.js'
import { CURRENCY_PLUGIN_NAMES, ION_ICONS, LOCKED_ICON, WALLET_LIST } from '../constants/indexConstants.js'
import s from '../locales/strings.js'
import * as ACCOUNT_SETTINGS from '../modules/Core/Account/settings.js'
import * as CORE_SELECTORS from '../modules/Core/selectors'
import { updateExchangeRates } from '../modules/ExchangeRates/action.js'
import { sendLogs } from '../modules/Logs/action.js'
import * as SETTINGS_ACTIONS from '../modules/Settings/SettingsActions.js'
import { Icon } from '../modules/UI/components/Icon/Icon.ui.js'
import { convertCurrency } from '../modules/UI/selectors.js'
import { newSpendingLimits } from '../reducers/SpendingLimitsReducer.js'
import { colors, THEME } from '../theme/variables/airbitz.js'
import type { Dispatch, GetState, State } from '../types/reduxTypes.js'
import { disableOtp, keepOtp } from './OtpActions.js'

export const updateOneSetting = (setting: Object) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const settings = state.ui.settings
  const updatedSettings = {
    ...settings,
    ...setting
  }
  dispatch(SETTINGS_ACTIONS.updateSettings(updatedSettings))
}

export const setPINModeRequest = (pinMode: boolean) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)
  ACCOUNT_SETTINGS.setPINModeRequest(account, pinMode)
    .then(() => dispatch(SETTINGS_ACTIONS.setPINMode(pinMode)))
    .catch(showError)
}

export const setAutoLogoutTimeInSecondsRequest = (autoLogoutTimeInSeconds: number) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)
  ACCOUNT_SETTINGS.setAutoLogoutTimeInSecondsRequest(account, autoLogoutTimeInSeconds)
    .then(() =>
      dispatch({
        type: 'UI/SETTINGS/SET_AUTO_LOGOUT_TIME',
        data: { autoLogoutTimeInSeconds }
      })
    )
    .catch(showError)
}

export const setDefaultFiatRequest = (defaultFiat: string) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)

  // PSEUDO_CODE
  // get spendingLimits
  const spendingLimits = state.ui.settings.spendingLimits
  const { transaction } = spendingLimits
  const previousDefaultIsoFiat = state.ui.settings.defaultIsoFiat

  Promise.resolve()
    .then(() => {
      // update default fiat in account settings
      ACCOUNT_SETTINGS.setDefaultFiatRequest(account, defaultFiat)
    })
    .then(() => {
      // update default fiat in settings
      dispatch(SETTINGS_ACTIONS.setDefaultFiat(defaultFiat))
      const nextDefaultIsoFiat = getState().ui.settings.defaultIsoFiat
      // convert from previous fiat to next fiat
      return convertCurrency(state, previousDefaultIsoFiat, nextDefaultIsoFiat, transaction.amount)
    })
    .then(transactionAmount => {
      const nextSpendingLimits = {
        transaction: {
          ...transaction,
          amount: parseFloat(transactionAmount.toFixed(2))
        }
      }

      // update spending limits in account settings
      ACCOUNT_SETTINGS.setSpendingLimits(account, nextSpendingLimits)
      // update spending limits in settings
      dispatch(newSpendingLimits(nextSpendingLimits))
      dispatch(updateExchangeRates())
    })
    .catch(showError)
}

export const setMerchantModeRequest = (merchantMode: boolean) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)
  ACCOUNT_SETTINGS.setMerchantModeRequest(account, merchantMode)
    .then(() => dispatch(SETTINGS_ACTIONS.setMerchantMode(merchantMode)))
    .catch(showError)
}

export const setPreferredSwapPluginId = (pluginId: string | void) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)
  ACCOUNT_SETTINGS.setPreferredSwapPluginId(account, pluginId)
    .then(() => dispatch({ type: 'UI/SETTINGS/SET_PREFERRED_SWAP_PLUGIN', data: pluginId }))
    .catch(showError)
}

export const setBluetoothModeRequest = (bluetoothMode: boolean) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)
  ACCOUNT_SETTINGS.setBluetoothModeRequest(account, bluetoothMode)
    .then(() => dispatch(SETTINGS_ACTIONS.setBluetoothMode(bluetoothMode)))
    .catch(showError)
}

export const checkCurrentPassword = (arg: string) => async (dispatch: Dispatch, getState: GetState) => {
  const clearPasswordError = { confirmPasswordError: '' }
  dispatch({ type: 'SET_CONFIRM_PASSWORD_ERROR', data: clearPasswordError })
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)
  const isPassword = await account.checkPassword(arg)
  dispatch(SETTINGS_ACTIONS.setSettingsLock(!isPassword))
  if (!isPassword) {
    dispatch({ type: 'SET_CONFIRM_PASSWORD_ERROR', data: { confirmPasswordError: s.strings.fragmet_invalid_password } })
  }
}

export const lockSettings = () => async (dispatch: Dispatch) => {
  dispatch(SETTINGS_ACTIONS.setSettingsLock(true))
}

// Denominations
export const setDenominationKeyRequest = (currencyCode: string, denominationKey: string) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)

  return ACCOUNT_SETTINGS.setDenominationKeyRequest(account, currencyCode, denominationKey)
    .then(() => dispatch(SETTINGS_ACTIONS.setDenominationKey(currencyCode, denominationKey)))
    .catch(showError)
}

// touch id interaction
export const updateTouchIdEnabled = (arg: boolean, account: EdgeAccount) => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const folder = downgradeDisklet(state.core.disklet)
  // dispatch the update for the new state for
  dispatch(SETTINGS_ACTIONS.updateTouchIdEnabled(arg))
  if (arg) {
    enableTouchId(folder, account)
  } else {
    disableTouchId(folder, account)
  }
}

export function togglePinLoginEnabled (pinLoginEnabled: boolean) {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const context = CORE_SELECTORS.getContext(state)
    const account = CORE_SELECTORS.getAccount(state)

    dispatch(SETTINGS_ACTIONS.togglePinLoginEnabled(pinLoginEnabled))
    return account.changePin({ enableLogin: pinLoginEnabled }).catch(async error => {
      showError(error)

      const pinLoginEnabled = await context.pinLoginEnabled(account.username)
      dispatch(SETTINGS_ACTIONS.togglePinLoginEnabled(pinLoginEnabled))
    })
  }
}

export const showReEnableOtpModal = () => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)
  const otpResetDate = account.otpResetDate
  if (!otpResetDate) return
  // Use `launchModal` to put the modal component on screen:
  const modal = createYesNoModal({
    title: s.strings.title_otp_keep_modal,
    message: s.strings.otp_modal_reset_description,
    icon: <Image source={iconImage} />,
    yesButtonText: s.strings.otp_keep,
    noButtonText: s.strings.otp_disable
  })
  const resolveValue = await launchModal(modal)
  if (resolveValue === true) {
    // true on positive, false on negative
    // let 2FA expire
    dispatch(keepOtp())
  } else if (resolveValue === false) {
    dispatch(disableOtp())
  } // if default of null (press backdrop) do not change anything and keep reminding
}

export const enableCustomNodes = (currencyCode: string) => async (dispatch: Dispatch, getState: GetState) => {
  const state: State = getState()
  const account = CORE_SELECTORS.getAccount(state)
  const currencyPluginName = CURRENCY_PLUGIN_NAMES[currencyCode]
  const currencyPlugin = account.currencyConfig[currencyPluginName]
  try {
    await currencyPlugin.changeUserSettings({ ...currencyPlugin.userSettings, disableFetchingServers: true })
  } catch (error) {
    showError(error)
  }
}

export const disableCustomNodes = (currencyCode: string) => async (dispatch: Dispatch, getState: GetState) => {
  const state: State = getState()
  const account = CORE_SELECTORS.getAccount(state)
  const currencyPluginName = CURRENCY_PLUGIN_NAMES[currencyCode]
  const currencyPlugin = account.currencyConfig[currencyPluginName]
  try {
    await currencyPlugin.changeUserSettings({ ...currencyPlugin.userSettings, disableFetchingServers: false })
  } catch (error) {
    showError(error)
  }
}

export const saveCustomNodesList = (currencyCode: string, nodesList: Array<string>) => async (dispatch: Dispatch, getState: GetState) => {
  const state: State = getState()
  const account = CORE_SELECTORS.getAccount(state)
  const currencyPluginName = CURRENCY_PLUGIN_NAMES[currencyCode]
  const currencyPlugin = account.currencyConfig[currencyPluginName]
  try {
    await currencyPlugin.changeUserSettings({ ...currencyPlugin.userSettings, electrumServers: nodesList })
  } catch (error) {
    showError(error)
  }
}

export const showUnlockSettingsModal = () => async (dispatch: Dispatch, getState: GetState) => {
  try {
    const input = {
      label: s.strings.enter_your_password,
      autoCorrect: false,
      returnKeyType: 'go',
      initialValue: '',
      autoFocus: true
    }
    const yesButton = {
      title: s.strings.string_done_cap
    }
    const noButton = {
      title: s.strings.string_cancel_cap
    }
    const validateInput = async (input): Promise<{ success: boolean, message: string }> => {
      const state = getState()
      const account = CORE_SELECTORS.getAccount(state)
      const isPassword = await account.checkPassword(input)
      if (isPassword) {
        dispatch({ type: 'PASSWORD_USED' })
        return {
          success: true,
          message: ''
        }
      } else {
        return {
          success: false,
          message: s.strings.password_reminder_invalid
        }
      }
    }
    const unlockSettingsModal = createSecureTextModal({
      icon: <Icon style={{ position: 'relative', left: 1 }} type={ION_ICONS} name={LOCKED_ICON} color={THEME.COLORS.PRIMARY} size={30} />,
      title: s.strings.confirm_password_text,
      input,
      yesButton,
      noButton,
      validateInput
    })
    const resolveValue = await launchModal(unlockSettingsModal)
    if (resolveValue) {
      dispatch(SETTINGS_ACTIONS.setSettingsLock(false))
    }
  } catch (error) {
    showError(error)
  }
}

export const showSendLogsModal = () => async (dispatch: Dispatch, getState: GetState) => {
  try {
    const input = {
      label: s.strings.settings_modal_text_entry_notes,
      autoCorrect: false,
      returnKeyType: 'go',
      initialValue: '',
      autoFocus: true
    }
    const yesButton = {
      title: s.strings.string_done_cap
    }
    const noButton = {
      title: s.strings.string_cancel_cap
    }
    // use standard icon instead?
    const unlockSettingsModal = createInputModal({
      icon: (
        <IonIcon
          name="ios-paper-plane"
          size={24}
          color={colors.primary}
          style={[
            {
              backgroundColor: THEME.COLORS.TRANSPARENT,
              zIndex: 1015,
              elevation: 1015
            }
          ]}
        />
      ),
      title: s.strings.settings_button_send_logs,
      input,
      yesButton,
      noButton
    })
    const notes = await launchModal(unlockSettingsModal)
    if (notes || notes === '') {
      await dispatch(sendLogs(notes))
      showToast(s.strings.settings_modal_send_logs_success)
    }
  } catch (error) {
    showError(error)
  }
}

export const showRestoreWalletsModal = () => async (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = state.core.account
  const restoreWalletsModal = createYesNoModal({
    title: s.strings.restore_wallets_modal_title,
    icon: <Icon type={'entypo'} name="wallet" size={30} />,
    message: s.strings.restore_wallets_modal_description,
    noButtonText: s.strings.restore_wallets_modal_cancel,
    yesButtonText: s.strings.restore_wallets_modal_confirm
  })
  const response = await launchModal(restoreWalletsModal)
  if (response) {
    const restoreKeys = account.allKeys.filter(key => key.archived || key.deleted)
    await Promise.all(
      restoreKeys
        .map(key => key.id)
        .map(walletId =>
          account.changeWalletStates({
            [walletId]: { archived: false, deleted: false }
          })
        )
    )
    Actions[WALLET_LIST]()
  }
}

export const setDeveloperModeOn = (developerModeOn: boolean) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const account = CORE_SELECTORS.getAccount(state)
  ACCOUNT_SETTINGS.setDeveloperModeOn(account, developerModeOn)
    .then(() => {
      if (developerModeOn) {
        dispatch({ type: 'DEVELOPER_MODE_ON' })
        return
      }
      dispatch({ type: 'DEVELOPER_MODE_OFF' })
    })
    .catch(showError)
}
