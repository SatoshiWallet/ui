// @flow

import { Actions } from 'react-native-router-flux'
import { connect } from 'react-redux'

import { postponePasswordReminder } from '../../../../actions/PasswordReminderActions.js'
import { CHANGE_PASSWORD } from '../../../../constants/indexConstants.js'
import type { Dispatch, State } from '../../../../types/reduxTypes.js'
import type { PasswordReminder } from '../../../../types/types.js'
import { checkPassword, requestChangePassword, setPasswordReminder } from './indexPasswordReminderModal.js'
import { PasswordReminderModal } from './PasswordReminderModal.ui.js'

export const mapStateToProps = (state: State) => ({
  loginStatus: state.ui.settings.loginStatus,
  status: state.ui.scenes.passwordReminderModal.status,
  isVisible: state.ui.passwordReminder.needsPasswordCheck,
  passwordReminder: state.ui.passwordReminder
})
export const mapDispatchToProps = (dispatch: Dispatch) => ({
  onSubmit: (password: string) => dispatch(checkPassword(password)),
  onRequestChangePassword: () => {
    Actions.jump(CHANGE_PASSWORD)
    dispatch(requestChangePassword())
  },
  onPostpone: () => dispatch(postponePasswordReminder()),
  setPasswordReminder: (passwordReminder: PasswordReminder) => dispatch(setPasswordReminder(passwordReminder))
})

export const passwordReminderModalConnector = connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordReminderModal)
