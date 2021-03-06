// @flow

import { StyleSheet } from 'react-native'

import THEME from '../theme/variables/airbitz.js'

export const stylesRaw = {
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  titleImage: {
    height: 25,
    width: 25,
    marginRight: 8,
    resizeMode: 'contain'
  },
  titleStyle: {
    alignSelf: 'center',
    fontSize: 20,
    color: THEME.COLORS.WHITE,
    fontFamily: THEME.FONTS.DEFAULT
  },
  menuIcon: {
    height: 22,
    color: THEME.COLORS.WHITE
  },
  menuIconStyle: {
    marginRight: 15
  },
  helpModal: {
    flex: 1
  },
  footerTabStyles: {
    height: THEME.FOOTER_TABS_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24
  }
}

export const styles = StyleSheet.create(stylesRaw)
