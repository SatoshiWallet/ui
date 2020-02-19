// @flow

import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import slowlog from 'react-native-slowlog'
import { sprintf } from 'sprintf-js'

import * as Constants from '../../constants/indexConstants'
import s from '../../locales/strings.js'
import { MenuDropDown } from '../../modules/UI/components/MenuDropDown/MenuDropDown.ui.js'
import { MenuDropDownStyle } from '../../styles/indexStyles'
import { scale } from '../../util/scaling.js'

type Props = {
  walletKey: string,
  executeWalletRowOption: (walletKey: string, option: string) => void,
  currencyCode: Array<string>,
  customStyles: StyleSheet.Styles
}

const modifiedMenuDropDownStyle = {
  // manually overwrite width
  ...MenuDropDownStyle,
  icon: {
    ...MenuDropDownStyle.icon,
    fontSize: scale(30),
    position: 'relative',
    top: 2
  }
}

export default class WalletListRowOptions extends Component<Props> {
  options: Array<{ value: string, label: string }>
  constructor (props: Props) {
    super(props)

    this.options = []
    for (const walletOption in Constants.WALLET_OPTIONS) {
      const option = Constants.WALLET_OPTIONS[walletOption]
      if (!option.currencyCode || option.currencyCode.includes(this.props.currencyCode)) {
        const temp = {
          value: option.value,
          label: option.label
        }
        if (option.value === Constants.SPLIT_VALUE) {
          const splitString = s.strings.string_split_wallet
          const currencyName = this.props.currencyCode === 'BTC' ? 'Bitcoin Cash' : 'Bitcoin SV'
          temp.label = sprintf(splitString, currencyName)
        }
        this.options.push(temp)
      }
    }
    slowlog(this, /.*/, global.slowlogOptions)
  }

  optionAction = (optionKey: string) => {
    this.props.executeWalletRowOption(this.props.walletKey, optionKey)
  }

  render () {
    return <MenuDropDown style={{ ...modifiedMenuDropDownStyle, ...this.props.customStyles }} onSelect={this.optionAction} data={this.options} />
  }
}
