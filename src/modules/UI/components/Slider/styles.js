// @flow

import { StyleSheet } from 'react-native'

import THEME from '../../../../theme/variables/airbitz'
import { PLATFORM } from '../../../../theme/variables/platform.js'

export const rawStyles = {
  container: {},
  slider: {
    backgroundColor: THEME.COLORS.OPACITY_WHITE,
    overflow: 'hidden',
    borderRadius: 26,
    height: 52,
    zIndex: 2
  },
  thumb: {
    width: 52,
    height: 52,
    position: 'absolute',
    backgroundColor: THEME.COLORS.WHITE,
    borderRadius: 52
  },
  disabledThumb: {
    width: 52,
    height: 52,
    position: 'absolute',
    backgroundColor: THEME.COLORS.GRAY_2,
    borderRadius: 52
  },
  textOverlay: {
    backgroundColor: THEME.COLORS.TRANSPARENT,
    fontSize: PLATFORM.deviceWidth >= 320 ? 13 : 16,
    position: 'absolute',
    color: THEME.COLORS.WHITE,
    alignSelf: 'center',
    top: 17,
    zIndex: 1
  },
  activityIndicator: {
    backgroundColor: THEME.COLORS.TRANSPARENT,
    position: 'absolute',
    alignSelf: 'center',
    top: 17,
    zIndex: 1
  }
}

export const styles = StyleSheet.create(rawStyles)

export default styles
