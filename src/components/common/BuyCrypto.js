// @flow

import React, { Component } from 'react'
import { Image, TouchableWithoutFeedback, View } from 'react-native'
import { Actions } from 'react-native-router-flux'
import { sprintf } from 'sprintf-js'

import * as Constants from '../../constants/indexConstants.js'
import s from '../../locales/strings.js'
import T from '../../modules/UI/components/FormattedText/index'
import style from '../../styles/scenes/TransactionListStyle.js'
import type { GuiWallet } from '../../types/types.js'

export type Props = {
  wallet: GuiWallet
}

export default class BuyCrypto extends Component<Props> {
  getCurrencyName = () => {
    const { wallet } = this.props
    return wallet.currencyNames[wallet.currencyCode]
  }

  render () {
    return (
      <TouchableWithoutFeedback onPress={Actions[Constants.PLUGIN_BUY]}>
        <View style={style.buyCryptoContainer}>
          <View style={style.buyCryptoBox}>
            <Image style={style.buyCryptoBoxImage} source={{ uri: this.props.wallet.symbolImage }} resizeMode={'cover'} />
            <T style={style.buyCryptoBoxText}>{sprintf(s.strings.transaction_list_buy_crypto_message, this.getCurrencyName)}</T>
          </View>
          <View style={style.buyCryptoNoTransactionBox}>
            <T style={style.buyCryptoNoTransactionText}>{s.strings.transaction_list_no_tx_yet}</T>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}
