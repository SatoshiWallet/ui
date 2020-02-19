// @flow

import React, { Component } from 'react'
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native'

import * as Constants from '../../../../constants/indexConstants'
import type { GuiCurrencyInfo, GuiWallet } from '../../../../types/types.js'
import { TextAndIconButton } from '../Buttons'
import { WalletNameHeader } from '../Header/Component/WalletNameHeader.ui'
import type { ExchangedFlipInputAmounts } from './ExchangedFlipInput2.js'
import { ExchangedFlipInput } from './ExchangedFlipInput2.js'

export type Props = {
  style: StyleSheet.Styles,
  guiWallet: GuiWallet,
  buttonText: string,
  currencyLogo: string,
  headerText: string,
  primaryCurrencyInfo: GuiCurrencyInfo,
  secondaryCurrencyInfo: GuiCurrencyInfo,
  fiatPerCrypto: number,
  forceUpdateGuiCounter: number,
  overridePrimaryExchangeAmount: string,
  isFocused: boolean,
  isThinking?: boolean,
  focusMe(): void,
  launchWalletSelector: () => void,
  onCryptoExchangeAmountChanged: ExchangedFlipInputAmounts => void,
  onNext: () => void
}
export class CryptoExchangeFlipInputWrapperComponent extends Component<Props> {
  launchSelector = () => {
    this.props.launchWalletSelector()
  }

  onExchangeAmountChanged = (amounts: ExchangedFlipInputAmounts) => {
    this.props.onCryptoExchangeAmountChanged(amounts)
  }

  renderLogo = (style: StyleSheet.Styles, logo: string) => {
    return (
      <View style={style.iconContainer}>
        <Image style={style.currencyIcon} source={{ uri: logo || '' }} />
      </View>
    )
  }

  render () {
    const style: StyleSheet.Styles = this.props.style
    const { onNext, primaryCurrencyInfo, secondaryCurrencyInfo, fiatPerCrypto, forceUpdateGuiCounter, overridePrimaryExchangeAmount } = this.props

    if (this.props.isThinking) {
      return (
        <View style={[style.containerNoFee, style.containerNoWalletSelected]}>
          <View style={style.topRow}>
            <ActivityIndicator />
          </View>
        </View>
      )
    }

    if (!this.props.guiWallet || this.props.guiWallet.id === '' || !primaryCurrencyInfo || !secondaryCurrencyInfo) {
      return (
        <View style={[style.containerNoFee, style.containerNoWalletSelected]}>
          <View style={style.topRow}>
            <TextAndIconButton
              style={style.noWalletSelected}
              onPress={this.launchSelector}
              icon={Constants.KEYBOARD_ARROW_DOWN}
              title={this.props.buttonText}
            />
          </View>
        </View>
      )
    }
    const guiWalletName = this.props.guiWallet.name
    const displayDenomination = this.props.primaryCurrencyInfo.displayCurrencyCode
    const titleComp = function (styles) {
      return <WalletNameHeader name={guiWalletName} denomination={displayDenomination} styles={styles} />
    }

    if (!this.props.isFocused) {
      return (
        <View style={[style.containerSelectedWalletNotFocus]}>
          {this.renderLogo(style, this.props.currencyLogo)}
          <View style={style.topRow}>
            <TextAndIconButton style={style.walletSelector} onPress={this.props.focusMe} icon={Constants.KEYBOARD_ARROW_DOWN} title={titleComp} />
          </View>
        </View>
      )
    }

    return (
      <ExchangedFlipInput
        onNext={onNext}
        headerText={this.props.headerText}
        headerLogo={this.props.currencyLogo}
        headerCallback={this.launchSelector}
        primaryCurrencyInfo={primaryCurrencyInfo}
        secondaryCurrencyInfo={secondaryCurrencyInfo}
        exchangeSecondaryToPrimaryRatio={fiatPerCrypto}
        overridePrimaryExchangeAmount={overridePrimaryExchangeAmount}
        forceUpdateGuiCounter={forceUpdateGuiCounter}
        onExchangeAmountChanged={this.onExchangeAmountChanged}
        keyboardVisible={false}
        isFiatOnTop={true}
        isFocus={false}
      />
    )
  }
}
