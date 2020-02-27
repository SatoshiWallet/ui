// @flow

import React, { Component } from 'react'
import { Linking, Text } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { WebView } from 'react-native-webview'

import s from '../../locales/strings.js'
import { Airship } from '../services/AirshipInstance.js'
import { type AirshipBridge, AirshipModal, ContentArea, dayText, ModalCloseArrow, textSize, THEME } from './modalParts.js'

const buildNumber = DeviceInfo.getBuildNumber()
const versionNumber = DeviceInfo.getVersion()
const SUPPORT_URI = 'https://support.satoshipoint.io'
const TICKET_URI = 'https://support.satoshipoint.io/hc/en-us/requests/new'
const REGISTER_URI = 'https://satoshipass.io'

export function showHelpModal (): Promise<mixed> {
  return Airship.show(bridge => <HelpModal bridge={bridge} />)
}

type Props = {
  bridge: AirshipBridge<mixed>
}

class HelpModal extends Component<Props> {
  webview: WebView | void

  render () {
    const { bridge } = this.props

    return (
      <AirshipModal bridge={bridge} onCancel={() => bridge.resolve()}>
        <ContentArea grow>
          <Text style={[dayText('center', 'largest'), { marginTop: 25, letterSpacing: -0.7 }]}>
            Satoshi
            <Text style={{ fontWeight: '300', color: THEME.COLORS.ACCENT_BLUE }}>Wallet</Text>
          </Text>
          <Text style={[dayText('center', 'small'), { lineHeight: textSize.large }]}>
            Built and maintained by
            {'\n'}
            SatoshiPoint in London, UK
            {'\n\n\n'}
            Need support?
          </Text>
          <Text
            style={[dayText('center', 'small'), { lineHeight: textSize.large, color: THEME.COLORS.ACCENT_BLUE }]}
            onPress={() => Linking.openURL(SUPPORT_URI)}
          >
            Visit the support centre
          </Text>
          <Text
            style={[dayText('center', 'small'), { lineHeight: textSize.large, color: THEME.COLORS.ACCENT_BLUE }]}
            onPress={() => Linking.openURL(TICKET_URI)}
          >
            Open a support ticket
          </Text>
          <Text style={[dayText('center', 'small'), { lineHeight: textSize.large }]}>
            {'\n'}
            Want to use a SatoshiPoint ATM?
          </Text>
          <Text
            style={[dayText('center', 'small'), { lineHeight: textSize.large, color: THEME.COLORS.ACCENT_BLUE }]}
            onPress={() => Linking.openURL(REGISTER_URI)}
          >
            Register here
          </Text>
          <Text style={[dayText('center', 'small'), { lineHeight: textSize.large, position: 'absolute', bottom: 10 }]}>
            {s.strings.help_version} {versionNumber}
            {'\n'}
            {s.strings.help_build} {buildNumber}
          </Text>
        </ContentArea>

        <ModalCloseArrow onPress={() => bridge.resolve()} />
      </AirshipModal>
    )
  }
}
