// @flow
import makeBlockie from 'ethereum-blockies-base64'
import React, { Component } from 'react'
import { Image, Linking, Text } from 'react-native'

import { SceneWrapper } from '../../../../components/common/SceneWrapper.js'
import type { GuiDenomination } from '../../../../types/types.js'
import { getObjectDiff } from '../../../../util/utils.js'
import { Button } from './Component/Button/Button.ui'
import Main from './Component/MainConnector'
import styles from './style'

export type Props = {
  currencyLogo: string,
  primaryDisplayCurrencyCode: string,
  primaryDisplayDenomination: GuiDenomination,
  primaryExchangeDenomination: GuiDenomination,
  secondaryDisplayCurrencyCode: string,
  secondaryToPrimaryRatio: number,
  styles: Object,
  username: string,
  openSelectUser: () => void,
  closeSelectUser: () => void,
  usersView: boolean,
  exchangeRate: number
}

export default class ControlPanel extends Component<Props> {
  shouldComponentUpdate (nextProps: Props) {
    const diffElement = getObjectDiff(this.props, nextProps, {
      primaryDisplayDenomination: true,
      primaryExchangeDenomination: true,
      styles: true
    })

    return !!diffElement
  }

  render () {
    const { exchangeRate } = this.props

    return (
      <SceneWrapper background="drawer" hasHeader={false} hasTabs={false}>
        <Button onPress={() => Linking.openURL('https://satoshipass.io')} style={styles.toggleButton} underlayColor={styles.underlay.color}>
          <Button.Row>
            <Button.Left>
              <Image style={styles.blockie} resizeMode={'contain'} source={{ uri: makeBlockie('SatoshiWallet Username: ' + this.props.username) }} />
            </Button.Left>

            <Button.Center>
              <Button.Text>
                <Text style={styles.userName}>{this.props.username}</Text>
                {'\n'}
                {exchangeRate ? <Text style={styles.active}>Active</Text> : <Text style={styles.loading}>Updating</Text>}
              </Button.Text>
            </Button.Center>
          </Button.Row>
        </Button>

        <Main />
      </SceneWrapper>
    )
  }
}
