// @flow

import type { EdgeAccount } from 'edge-core-js'
import { connect } from 'react-redux'

import {
  checkCurrentPassword,
  lockSettings,
  setAutoLogoutTimeInSecondsRequest,
  setDeveloperModeOn,
  showRestoreWalletsModal,
  showSendLogsModal,
  showUnlockSettingsModal,
  togglePinLoginEnabled,
  updateTouchIdEnabled
} from '../../actions/SettingsActions'
import SettingsOverview from '../../components/scenes/SettingsOverviewScene'
import * as Constants from '../../constants/indexConstants'
import * as CORE_SELECTORS from '../../modules/Core/selectors'
import { resetSendLogsStatus, sendLogs } from '../../modules/Logs/action'
import * as SETTINGS_SELECTORS from '../../modules/Settings/selectors'
import type { Dispatch, State } from '../../types/reduxTypes.js'

// settings_button_lock_settings, or //settings_button_unlock_settings

const mapStateToProps = (state: State) => {
  const isLocked = SETTINGS_SELECTORS.getSettingsLock(state)
  const lockButtonIcon = isLocked ? Constants.LOCKED_ICON : Constants.UNLOCKED_ICON
  const lockButton = isLocked ? 'settings_button_unlock_settings' : 'settings_button_lock_settings'
  const account = CORE_SELECTORS.getAccount(state)
  const isTouchIdSupported = SETTINGS_SELECTORS.getIsTouchIdSupported(state)
  const isTouchIdEnabled = SETTINGS_SELECTORS.getIsTouchIdEnabled(state)
  const confirmPasswordError = SETTINGS_SELECTORS.getConfirmPasswordErrorMessage(state)
  const sendLogsStatus = SETTINGS_SELECTORS.getSendLogsStatus(state)
  const pinLoginEnabled = SETTINGS_SELECTORS.getPinLoginEnabled(state)
  const developerModeOn = state.ui.settings.developerModeOn
  return {
    defaultFiat: SETTINGS_SELECTORS.getDefaultFiat(state),
    autoLogoutTimeInSeconds: SETTINGS_SELECTORS.getAutoLogoutTimeInSeconds(state),
    username: CORE_SELECTORS.getUsername(state),
    account,
    supportsTouchId: isTouchIdSupported,
    touchIdEnabled: isTouchIdEnabled,
    lockButton,
    lockButtonIcon,
    isLocked,
    confirmPasswordError,
    sendLogsStatus,
    pinLoginEnabled,
    developerModeOn
  }
}
const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAutoLogoutTimeInSeconds: (autoLogoutTimeInSeconds: number) => dispatch(setAutoLogoutTimeInSecondsRequest(autoLogoutTimeInSeconds)),
  confirmPassword: (arg: string) => dispatch(checkCurrentPassword(arg)),
  lockSettings: () => dispatch(lockSettings()),
  dispatchUpdateEnableTouchIdEnable: (arg: boolean, account: EdgeAccount) => dispatch(updateTouchIdEnabled(arg, account)),
  sendLogs: (text: string) => dispatch(sendLogs(text)),
  resetConfirmPasswordError: (arg: Object) => dispatch({ type: 'SET_CONFIRM_PASSWORD_ERROR', data: arg }),
  resetSendLogsStatus: () => dispatch(resetSendLogsStatus()),
  onTogglePinLoginEnabled: (enableLogin: boolean) => dispatch(togglePinLoginEnabled(enableLogin)),
  showUnlockSettingsModal: () => dispatch(showUnlockSettingsModal()),
  showSendLogsModal: () => dispatch(showSendLogsModal()),
  showRestoreWalletsModal: () => dispatch(showRestoreWalletsModal()),
  toggleDeveloperMode: (developerModeOn: boolean) => dispatch(setDeveloperModeOn(developerModeOn))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsOverview)
