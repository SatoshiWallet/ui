// @flow

import { connect } from 'react-redux'

import { parseScannedUri, qrCodeScanned, toggleAddressModal } from '../../actions/ScanActions'
import Scan from '../../components/scenes/ScanScene'
import type { Dispatch, State } from '../../types/reduxTypes.js'

const mapStateToProps = (state: State) => ({
  cameraPermission: state.permissions.camera,
  torchEnabled: state.ui.scenes.scan.torchEnabled,
  scanEnabled: state.ui.scenes.scan.scanEnabled,
  deepLinkPending: state.core.deepLinking.deepLinkPending,
  deepLinkUri: state.core.deepLinking.addressDeepLinkData.uri
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  qrCodeScanned: data => dispatch(qrCodeScanned(data)),
  parseScannedUri: data => dispatch(parseScannedUri(data)),
  toggleEnableTorch: () => dispatch({ type: 'TOGGLE_ENABLE_TORCH' }),
  toggleAddressModal: () => dispatch(toggleAddressModal()),
  markAddressDeepLinkDone: () =>
    dispatch({
      type: 'ADDRESS_DEEP_LINK_COMPLETE'
    })
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Scan)
