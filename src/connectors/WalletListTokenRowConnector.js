// @flow

import type { EdgeDenomination } from 'edge-core-js'
import { connect } from 'react-redux'

import { selectWallet } from '../actions/WalletActions'
import type { DispatchProps, StateProps } from '../components/common/WalletListTokenRow.js'
import { WalletListTokenRow } from '../components/common/WalletListTokenRow.js'
import * as SETTINGS_SELECTORS from '../modules/Settings/selectors'
import { getWallet } from '../modules/UI/selectors.js'
import type { Dispatch, State } from '../types/reduxTypes.js'

const mapStateToProps = (state: State, ownProps): StateProps => {
  const currencyCode: string = ownProps.currencyCode
  const settings = state.ui.settings
  const exchangeRates = state.exchangeRates
  const displayDenomination: EdgeDenomination = SETTINGS_SELECTORS.getDisplayDenominationFull(state, currencyCode)
  const wallet = getWallet(state, ownProps.parentId)

  return {
    displayDenomination,
    wallet,
    currencyCode,
    settings,
    exchangeRates
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  selectWallet: (walletId, currencyCode) => dispatch(selectWallet(walletId, currencyCode))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletListTokenRow)
