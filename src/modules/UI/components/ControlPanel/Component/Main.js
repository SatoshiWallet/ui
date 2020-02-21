// @flow

import React, { Component } from 'react'
import { Image, ScrollView, Text, View } from 'react-native'
import { Actions } from 'react-native-router-flux'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'

// import termsIcon from '../../../../../assets/images/sidenav/terms.png'
import walletIcon from '../../../../../assets/images/sidenav/wallets.png'
import * as Constants from '../../../../../constants/indexConstants.js'
import s from '../../../../../locales/strings.js'
import styles from '../style'
import { Button } from './Button/Button.ui.js'
import { Separator } from './Separator/Separator.ui.js'
import UserList from './UserListConnector'

const WALLETS_TEXT = s.strings.drawer_wallets
const SCAN_TEXT = s.strings.drawer_scan_qr_send
const SWEEP_PRIVATE_KEY_TEXT = s.strings.drawer_sweep_private_key
const REQUEST_TEXT = s.strings.drawer_request
const EXCHANGE_TEXT = s.strings.drawer_exchange
const LOGOUT_TEXT = s.strings.settings_button_logout
const SETTINGS_TEXT = s.strings.settings_title
const PLUGIN_BUY_TEXT = s.strings.title_plugin_buy
// const TERMS_OF_SERVICE_TEXT = s.strings.title_terms_of_service

export type Props = {
  logout: (username?: string) => void,
  registerFioAddress: () => Promise<mixed>,
  usersView: boolean
}
export default class Main extends Component<Props> {
  render () {
    const { usersView } = this.props

    return usersView ? (
      <UserList />
    ) : (
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <ScrollView>
          <View>
            <View>
              <Separator />
              <WalletsButton />
              <Separator />
              <ScanButton />
              <Separator />
              <SweepPrivateKeyButton />
              <Separator />
              <RequestButton />
              <Separator />
              <ExchangeButton />
              <Separator />
              <Separator />
              <BuyButton />
              <Separator />
              <SettingsButton />
              <Separator />
            </View>
          </View>
        </ScrollView>
        <View>
          <Separator />
          <LogoutButton onPress={this.handleLogout} />
        </View>
      </View>
    )
  }

  handleLogout = () => {
    this.props.logout()
  }
}

const popToPluginBuyScene = () => Actions.jump(Constants.PLUGIN_BUY)
const BuyButton = () => {
  return (
    <Button onPress={popToPluginBuyScene}>
      <Button.Row>
        <Button.Row>
          <Button.Left>
            <FontAwesomeIcon name="location-arrow" color={styles.iconColor.color} size={styles.iconImage.height} />
          </Button.Left>

          <Button.Center>
            <Button.Text>
              <Text>{PLUGIN_BUY_TEXT}</Text>
            </Button.Text>
          </Button.Center>
        </Button.Row>
      </Button.Row>
    </Button>
  )
}

const popToWalletListScene = () => Actions.jump(Constants.WALLET_LIST_SCENE)
const WalletsButton = () => {
  return (
    <Button onPress={popToWalletListScene}>
      <Button.Row>
        <Button.Row>
          <Button.Left>
            <Image source={walletIcon} style={styles.iconImage} />
          </Button.Left>

          <Button.Center>
            <Button.Text>
              <Text>{WALLETS_TEXT}</Text>
            </Button.Text>
          </Button.Center>
        </Button.Row>
      </Button.Row>
    </Button>
  )
}

const ScanButton = () => {
  return (
    <Button onPress={Actions.scan}>
      <Button.Row>
        <Button.Left>
          <FontAwesomeIcon name="qrcode" color={styles.iconColor.color} size={styles.iconImage.height} />
        </Button.Left>

        <Button.Center>
          <Button.Text>
            <Text>{SCAN_TEXT}</Text>
          </Button.Text>
        </Button.Center>
      </Button.Row>
    </Button>
  )
}

const SweepPrivateKeyButton = () => {
  /* eslint-disable no-unused-vars */
  const routeWithData = () => Actions.scan('sweepPrivateKey')
  /* eslint-disable no-unused-vars */
  return (
    <Button onPress={routeWithData}>
      <Button.Row>
        <Button.Left>
          <FontAwesomeIcon name="key" color={styles.iconColor.color} size={styles.iconImage.height} />
        </Button.Left>

        <Button.Center>
          <Button.Text>
            <Text>{SWEEP_PRIVATE_KEY_TEXT}</Text>
          </Button.Text>
        </Button.Center>
      </Button.Row>
    </Button>
  )
}

const RequestButton = () => {
  return (
    <Button onPress={Actions.request}>
      <Button.Row>
        <Button.Left>
          <FontAwesomeIcon name="arrow-down" color={styles.iconColor.color} size={styles.iconImage.height} />
        </Button.Left>

        <Button.Center>
          <Button.Text>
            <Text>{REQUEST_TEXT}</Text>
          </Button.Text>
        </Button.Center>
      </Button.Row>
    </Button>
  )
}

const ExchangeButton = () => {
  return (
    <Button onPress={Actions.exchange}>
      <Button.Row>
        <Button.Left>
          <FontAwesomeIcon name="exchange" color={styles.iconColor.color} size={styles.iconImage.height} />
        </Button.Left>

        <Button.Center>
          <Button.Text>
            <Text>{EXCHANGE_TEXT}</Text>
          </Button.Text>
        </Button.Center>
      </Button.Row>
    </Button>
  )
}

// const TermsOfServiceButton = () => {
//   return (
//     <Button onPress={Actions[Constants.TERMS_OF_SERVICE]}>
//       <Button.Row>
//         <Button.Left>
//           <Image source={termsIcon} style={styles.iconImage} />
//         </Button.Left>

//         <Button.Center>
//           <Button.Text>
//             <Text>{TERMS_OF_SERVICE_TEXT}</Text>
//           </Button.Text>
//         </Button.Center>
//       </Button.Row>
//     </Button>
//   )
// }

const SettingsButton = () => {
  return (
    <Button onPress={Actions.settingsOverviewTab}>
      <Button.Row>
        <Button.Left>
          <FontAwesomeIcon name="cog" color={styles.iconColor.color} size={styles.iconImage.height} />
        </Button.Left>

        <Button.Center>
          <Button.Text>
            <Text>{SETTINGS_TEXT}</Text>
          </Button.Text>
        </Button.Center>
      </Button.Row>
    </Button>
  )
}

const LogoutButton = ({ onPress }) => {
  return (
    <Button onPress={onPress}>
      <Button.Row>
        <Button.Left>
          <FontAwesomeIcon name="sign-out" color={styles.iconColor.color} size={styles.iconImage.height} />
        </Button.Left>

        <Button.Center>
          <Button.Text>
            <Text>{LOGOUT_TEXT}</Text>
          </Button.Text>
        </Button.Center>
      </Button.Row>
    </Button>
  )
}
