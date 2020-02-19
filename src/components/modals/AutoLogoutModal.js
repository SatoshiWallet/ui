// @flow

import { PrimaryButton, SecondaryButton } from 'edge-components'
import React, { Component } from 'react'
import { Picker, Text, View } from 'react-native'
import IonIcon from 'react-native-vector-icons/Ionicons'

import s from '../../locales/strings.js'
import { THEME } from '../../theme/variables/airbitz.js'
import { type DisplayTime, displayToSeconds, secondsToDisplay } from '../../util/displayTime.js'
import { LadderLayout } from '../common/LadderLayout.js'
import { type AirshipBridge, AirshipModal, ContentArea, dayText, IconCircle } from './modalParts.js'

type Props = {
  bridge: AirshipBridge<number | null>,
  autoLogoutTimeInSeconds: number
}

type State = DisplayTime

export class AutoLogoutModal extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    const { autoLogoutTimeInSeconds } = this.props
    this.state = secondsToDisplay(autoLogoutTimeInSeconds)

    // Default to `hours` if it's disabled:
    if (this.state.value === 0) this.state.measurement = 'hours'
  }

  handleDone = () => {
    this.props.bridge.resolve(displayToSeconds(this.state))
  }

  handleCancel = () => {
    const { bridge } = this.props
    bridge.resolve(null)
  }

  render () {
    const { bridge } = this.props

    const numberPickerOptions = [<Picker.Item key={'disable'} label={s.strings.string_disable} value={0} />]
    for (let i = 1; i < 60; i++) {
      const text = String(i)
      numberPickerOptions.push(<Picker.Item key={text} label={text} value={i} />)
    }

    const numberPicker = (
      <Picker style={{ flex: 1 }} selectedValue={this.state.value} onValueChange={value => this.setState({ value })}>
        {numberPickerOptions}
      </Picker>
    )

    const measurementPicker = (
      <Picker style={{ flex: 1 }} selectedValue={this.state.measurement} onValueChange={measurement => this.setState({ measurement })}>
        <Picker.Item label={s.strings.settings_seconds} value="seconds" />
        <Picker.Item label={s.strings.settings_minutes} value="minutes" />
        <Picker.Item label={s.strings.settings_hours} value="hours" />
        <Picker.Item label={s.strings.settings_days} value="days" />
      </Picker>
    )

    return (
      <AirshipModal bridge={bridge} onCancel={this.handleCancel}>
        <IconCircle>
          <IonIcon name={'ios-time'} size={THEME.rem(2)} color={THEME.COLORS.SECONDARY} />
        </IconCircle>
        <ContentArea>
          <Text style={dayText('title')}>{s.strings.dialog_title}</Text>
          <View style={{ flexDirection: 'row' }}>
            <LadderLayout horizontal padding={THEME.rem(1)}>
              {numberPicker}
              {measurementPicker}
            </LadderLayout>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <LadderLayout horizontal padding={THEME.rem(1)}>
              <SecondaryButton onPress={this.handleCancel} style={{ flex: 1 }}>
                <SecondaryButton.Text>{s.strings.string_cancel_cap}</SecondaryButton.Text>
              </SecondaryButton>
              <PrimaryButton onPress={this.handleDone} style={{ flex: 1 }}>
                <PrimaryButton.Text>{s.strings.string_save}</PrimaryButton.Text>
              </PrimaryButton>
            </LadderLayout>
          </View>
        </ContentArea>
      </AirshipModal>
    )
  }
}
