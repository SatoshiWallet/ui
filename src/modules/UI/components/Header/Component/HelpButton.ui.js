// @flow

import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'

import { showHelpModal } from '../../../../../components/modals/HelpModal.js'
import styles from '../style'

type Props = {}

export default class HelpButton extends Component<Props> {
  render () {
    return (
      <TouchableOpacity style={styles.sideTextWrap} onPress={() => showHelpModal()}>
        <FontAwesomeIcon name="info" color={styles.helpIcon.color} size={styles.helpIcon.height} style={styles.helpIconStyles} />
      </TouchableOpacity>
    )
  }
}
