// @flow

import { connect } from 'react-redux'

import { checkEnabledTokensArray, setWalletEnabledTokens } from '../../actions/WalletActions.js'
import type { ManageTokensDispatchProps, ManageTokensOwnProps, ManageTokensStateProps } from '../../components/scenes/ManageTokensScene.js'
import ManageTokens from '../../components/scenes/ManageTokensScene.js'
import type { State } from '../../types/reduxTypes.js'

const mapStateToProps = (state: State, ownProps: ManageTokensOwnProps): ManageTokensStateProps => ({
  manageTokensPending: state.ui.wallets.manageTokensPending,
  guiWallet: ownProps.guiWallet,
  settingsCustomTokens: state.ui.settings.customTokens
})
const mapDispatchToProps = (dispatch: Dispatch): ManageTokensDispatchProps => ({
  setEnabledTokensList: (walletId: string, enabledTokens: Array<string>, oldEnabledTokensList: Array<string>) => {
    dispatch(setWalletEnabledTokens(walletId, enabledTokens, oldEnabledTokensList))
    dispatch(checkEnabledTokensArray(walletId, enabledTokens))
  }
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManageTokens)
