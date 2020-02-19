// @flow

import { connect } from 'react-redux'

import { showSendLogsModal } from '../../actions/SettingsActions'
import Login from '../../components/scenes/LoginScene'
import * as CORE_SELECTORS from '../../modules/Core/selectors'
import { initializeAccount } from '../../modules/Login/action'
import type { Dispatch, State } from '../../types/reduxTypes.js'

const mapStateToProps = (state: State) => ({
  context: CORE_SELECTORS.getContext(state),
  account: CORE_SELECTORS.getAccount(state),
  username: state.nextUsername == null ? '' : state.nextUsername,
  recoveryLogin: state.core.deepLinking.passwordRecoveryLink
})
const mapDispatchToProps = (dispatch: Dispatch) => ({
  showSendLogsModal: () => dispatch(showSendLogsModal()),
  initializeAccount: (account, touchIdInfo) => dispatch(initializeAccount(account, touchIdInfo))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
