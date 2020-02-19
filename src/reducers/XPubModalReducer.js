// @flow

import s from '../locales/strings.js'
import type { Action } from '../types/reduxTypes.js'

export const xPubSyntax = (state: string = '', action: Action): string => {
  switch (action.type) {
    case 'OPEN_VIEWXPUB_WALLET_MODAL': {
      if (!action.data) throw new Error('Invalid action')
      return action.data.xPub || s.strings.fragment_wallets_no_xpub
    }

    case 'CLOSE_VIEWXPUB_WALLET_MODAL': {
      return ''
    }

    default:
      return state
  }
}

export const xPubExplorer = (state: string = '', action: Action): string => {
  switch (action.type) {
    case 'OPEN_VIEWXPUB_WALLET_MODAL': {
      if (!action.data) throw new Error('Invalid action')
      return action.data.xPubExplorer
    }

    case 'CLOSE_VIEWXPUB_WALLET_MODAL': {
      return ''
    }

    default:
      return state
  }
}
