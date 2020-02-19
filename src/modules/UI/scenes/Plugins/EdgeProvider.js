// @flow

import { bns } from 'biggystring'
import { createSimpleConfirmModal } from 'edge-components'
import type { EdgeCurrencyWallet, EdgeMetadata, EdgeNetworkFee, EdgeSpendTarget, EdgeTransaction } from 'edge-core-js'
import React from 'react'
import { Linking } from 'react-native'
import Mailer from 'react-native-mail'
import { Actions } from 'react-native-router-flux'
import SafariView from 'react-native-safari-view'
import { Bridgeable } from 'yaob'

import { createCurrencyWalletAndSelectForPlugins } from '../../../../actions/indexActions'
import { trackAccountEvent, trackConversion } from '../../../../actions/TrackingActions.js'
import { selectWallet } from '../../../../actions/WalletActions'
import { launchModal } from '../../../../components/common/ModalProvider.js'
import { Airship, showError, showToast } from '../../../../components/services/AirshipInstance.js'
import { WalletListModalConnected as WalletListModal } from '../../../../connectors/components/WalletListModalConnector.js'
import { DEFAULT_STARTER_WALLET_NAMES, EXCLAMATION, MATERIAL_COMMUNITY } from '../../../../constants/indexConstants'
import { SEND_CONFIRMATION } from '../../../../constants/SceneKeys.js'
import s from '../../../../locales/strings'
import * as SETTINGS_SELECTORS from '../../../../modules/Settings/selectors.js'
import { Icon } from '../../../../modules/UI/components/Icon/Icon.ui.js'
import type { GuiMakeSpendInfo } from '../../../../reducers/scenes/SendConfirmationReducer.js'
import type { Dispatch, State } from '../../../../types/reduxTypes.js'
import type { BuySellPlugin, GuiWallet } from '../../../../types/types.js'
import * as CORE_SELECTORS from '../../../Core/selectors.js'
import * as UI_SELECTORS from '../../../UI/selectors.js'

type EdgeReceiveAddress = {
  publicAddress?: string,
  segwitAddress?: string,
  legacyAddress?: string
}
type WalletDetails = {
  name: string,
  receiveAddress: {
    publicAddress: string
  },
  currencyCode: string,
  fiatCurrencyCode: string
}

type EdgeRequestSpendOptions = {
  // Specify the currencyCode to spend to this URI. Required for spending tokens
  currencyCode?: string,

  // This overrides any parameters specified in a URI such as label or message
  metadata?: EdgeMetadata,
  networkFeeOption?: 'low' | 'standard' | 'high',

  // If true, do not allow the user to change the amount to spend
  lockInputs?: boolean,

  // Do not broadcast transaction
  signOnly?: boolean,

  // Additional identifier such as a payment ID for Monero or destination tag for Ripple/XRP
  // This overrides any parameters specified in a URI
  uniqueIdentifier?: string,

  customNetworkFee?: EdgeNetworkFee
}

type EdgeGetReceiveAddressOptions = {
  // Metadata to tag these addresses with for when funds arrive at the address
  metadata?: EdgeMetadata
}

export type EdgeProviderSpendTarget = EdgeSpendTarget & {
  exchangeAmount?: string
}

export class EdgeProvider extends Bridgeable {
  _pluginId: string
  _plugin: BuySellPlugin
  _dispatch: Dispatch
  _state: State

  constructor (plugin: BuySellPlugin, state: State, dispatch: Dispatch) {
    super()
    this._plugin = plugin
    this._pluginId = plugin.pluginId
    this._dispatch = dispatch
    this._state = state
  }

  updateState = (arg: any) => {
    this._state = arg
  }

  // Set the currency wallet to interact with. This will show a wallet selector modal
  // for the user to pick a wallet within their list of wallets that match `currencyCodes`
  // Returns the currencyCode chosen by the user (store: Store)
  async chooseCurrencyWallet (cCodes: Array<string> = []): Promise<string> {
    const currencyCodes = []
    const currencyCodeCount = {}
    let i = 0
    for (i; i < cCodes.length; i++) {
      currencyCodes.push(cCodes[i].toUpperCase())
      currencyCodeCount[cCodes[i].toUpperCase()] = 0
    }

    const wallets = this._state.ui.wallets.byId // CORE_SELECTORS.getWallets(this._state)
    const excludedCurrencyCode = []
    const excludedTokens = []
    const walletsToUse = []
    const walletsToUseCCode = []
    for (const key in wallets) {
      const wallet = wallets[key]
      if (currencyCodes.length === 0) {
        walletsToUse.push(wallet)
        walletsToUseCCode.push(wallet.currencyCode)
      } else {
        if (!currencyCodes.includes(wallet.currencyCode) && wallet.enabledTokens.length > 0) {
          if (!excludedCurrencyCode.includes(wallet.currencyCode)) {
            excludedCurrencyCode.push(wallet.currencyCode)
          }
          const ignoredCodes = []
          let i = 0
          for (i; i < wallet.enabledTokens.length; i++) {
            if (!currencyCodes.includes(wallet.enabledTokens[i])) {
              excludedTokens.push(wallet.enabledTokens[i])
              ignoredCodes.push(wallet.enabledTokens[i])
            }
          }
          if (wallet.enabledTokens.length > 0 && ignoredCodes.length < wallet.enabledTokens.length) {
            walletsToUse.push(wallet)
            walletsToUseCCode.push(wallet.currencyCode)
          }
        }
        if (currencyCodes.includes(wallet.currencyCode)) {
          if (wallet.enabledTokens.length > 0) {
            let i = 0
            for (i; i < wallet.enabledTokens.length; i++) {
              if (!currencyCodes.includes(wallet.enabledTokens[i])) {
                excludedTokens.push(wallet.enabledTokens[i])
              }
            }
          }
          walletsToUse.push(wallet)
          walletsToUseCCode.push(wallet.currencyCode)
          currencyCodeCount[wallet.currencyCode]++
        }
      }
    }
    //
    const supportedWalletTypesPreFilter = SETTINGS_SELECTORS.getSupportedWalletTypes(this._state)
    const supportedWalletTypes = []
    for (let i = 0; i < supportedWalletTypesPreFilter.length; i++) {
      const swt = supportedWalletTypesPreFilter[i]
      if (currencyCodes.includes(swt.currencyCode) && !walletsToUseCCode.includes(swt.currencyCode)) {
        supportedWalletTypes.push(swt)
      }
    }
    // check to see if there are any requested codes that there are no wallets for
    const noWalletCodes = []
    if (currencyCodes.length > 0 && walletsToUse.length < 1 && supportedWalletTypes.length < 1) {
      for (const key in currencyCodeCount) {
        if (currencyCodeCount[key] === 0) {
          noWalletCodes.push(key)
        }
      }
    }
    const selectedWallet = await Airship.show(bridge => (
      <WalletListModal
        bridge={bridge}
        wallets={walletsToUse}
        supportedWalletTypes={supportedWalletTypes}
        excludedCurrencyCode={excludedCurrencyCode}
        showWalletCreators={true}
        headerTitle={s.strings.choose_your_wallet}
        excludedTokens={excludedTokens}
        noWalletCodes={noWalletCodes}
        disableZeroBalance={false}
      />
    ))

    if (selectedWallet) {
      if (selectedWallet.id) {
        const code = selectedWallet.currencyCode
        this._dispatch(selectWallet(selectedWallet.id, code))
        return Promise.resolve(code)
      }
      const settings = SETTINGS_SELECTORS.getSettings(this._state)
      const walletName = DEFAULT_STARTER_WALLET_NAMES[selectedWallet.currencyCode]
      try {
        if (typeof selectedWallet.value === 'string') {
          const newWallet: EdgeCurrencyWallet = await this._dispatch(
            createCurrencyWalletAndSelectForPlugins(walletName, selectedWallet.value, settings.defaultIsoFiat)
          )
          this._dispatch(selectWallet(newWallet.id, newWallet.currencyInfo.currencyCode))
          const returnString: string = newWallet.currencyInfo.currencyCode
          return Promise.resolve(returnString)
        }
      } catch (e) {
        const modal = createSimpleConfirmModal({
          title: s.strings.create_wallet_failed_header,
          message: s.strings.create_wallet_failed_message,
          icon: <Icon type={MATERIAL_COMMUNITY} name={EXCLAMATION} size={30} />,
          buttonText: s.strings.string_ok
        })
        return launchModal(modal).then(
          (response): Promise<string> => {
            throw new Error(s.strings.user_closed_modal_no_wallet)
          }
        )
      }
    }
    throw new Error(s.strings.user_closed_modal_no_wallet)
  }

  // Get an address from the user's wallet
  getReceiveAddress (options: EdgeGetReceiveAddressOptions): EdgeReceiveAddress {
    const wallet: GuiWallet = UI_SELECTORS.getSelectedWallet(this._state)
    if (options && options.metadata) {
      wallet.receiveAddress.metadata = options.metadata
    }
    return Promise.resolve(wallet.receiveAddress)
  }

  getCurrentWalletInfo (): Promise<WalletDetails> {
    const wallet: GuiWallet = UI_SELECTORS.getSelectedWallet(this._state)
    const currentCode = UI_SELECTORS.getSelectedCurrencyCode(this._state)
    let walletName = wallet.name
    if (wallet.enabledTokens.length > 1) {
      console.log('EP: We have tokens.. what do we do with them ')
      walletName = currentCode
    }
    const returnObject: WalletDetails = {
      name: walletName,
      receiveAddress: wallet.receiveAddress,
      currencyCode: currentCode,
      fiatCurrencyCode: wallet.fiatCurrencyCode,
      currencyIcon: wallet.symbolImage,
      currencyIconDark: wallet.symbolImageDarkMono
    }
    return Promise.resolve(returnObject)
  }

  openURL (url: string): void {
    Linking.openURL(url)
  }
  openEmailApp (emailAddress: string) {
    Mailer.mail(
      {
        subject: '',
        recipients: [emailAddress],
        body: '',
        isHTML: true
      },
      (error, event) => {
        if (error) showError(error)
      }
    )
  }

  consoleLog (arg: any): void {
    console.log('EP: BridgeLog', arg)
  }

  // Write data to user's account. This data is encrypted and persisted in their Edge
  // account and transferred between devices
  async writeData (data: { [key: string]: string }) {
    const account = CORE_SELECTORS.getAccount(this._state)
    const store = account.dataStore
    console.log('edgeProvider writeData: ', JSON.stringify(data))
    await Promise.all(Object.keys(data).map(key => store.setItem(this._pluginId, key, data[key])))
    console.log('edgeProvider writeData Success')
    return { success: true }
  }

  // Read data back from the user's account. This can only access data written by this same plugin
  // 'keys' is an array of strings with keys to lookup.
  // Returns an object with a map of key value pairs from the keys passed in
  async readData (keys: Array<string>): Promise<Object> {
    const account = CORE_SELECTORS.getAccount(this._state)
    const store = account.dataStore
    const returnObj = {}
    for (let i = 0; i < keys.length; i++) {
      returnObj[keys[i]] = await store.getItem(this._pluginId, keys[i]).catch(e => undefined)
    }
    console.log('edgeProvider readData: ', JSON.stringify(returnObj))
    return returnObj
  }

  async exitPlugin () {
    Actions.pop()
  }

  // Request that the user spend to an address or multiple addresses
  async requestSpend (spendTargets: Array<EdgeProviderSpendTarget>, options?: EdgeRequestSpendOptions): Promise<EdgeTransaction | void> {
    const guiWallet = UI_SELECTORS.getSelectedWallet(this._state)
    const coreWallet = CORE_SELECTORS.getWallet(this._state, guiWallet.id)

    const info: GuiMakeSpendInfo = {}
    if (options && options.currencyCode) {
      info.currencyCode = options.currencyCode
    } else {
      info.currencyCode = coreWallet.currencyInfo.currencyCode
    }

    if (options && options.customNetworkFee) {
      info.customNetworkFee = options.customNetworkFee
    }
    if (options && options.metadata) {
      info.metadata = options.metadata
    }
    if (options && options.lockInputs) {
      info.lockInputs = options.lockInputs
    }
    if (options && options.uniqueIdentifier) {
      info.uniqueIdentifier = options.uniqueIdentifier
    }

    for (const spendTarget of spendTargets) {
      if (spendTarget.exchangeAmount && !spendTarget.nativeAmount) {
        spendTarget.nativeAmount = await coreWallet.denominationToNative(spendTarget.exchangeAmount, info.currencyCode)
      }
    }
    const edgeSpendTargets: any = spendTargets
    const edgeSpendTargets2: Array<EdgeSpendTarget> = edgeSpendTargets
    info.spendTargets = edgeSpendTargets2
    const transaction = await this._makeSpendRequest(info)
    if (transaction) {
      Actions.pop()

      const exchangeAmount = await coreWallet.nativeToDenomination(transaction.nativeAmount, transaction.currencyCode)
      trackConversion('EdgeProviderConversion', {
        pluginId: this._pluginId,
        account: CORE_SELECTORS.getAccount(this._state),
        currencyCode: transaction.currencyCode,
        exchangeAmount: Number(bns.abs(exchangeAmount))
      })
    }
    return transaction
  }

  // Request that the user spend to a URI
  async requestSpendUri (uri: string, options?: EdgeRequestSpendOptions): Promise<EdgeTransaction | void> {
    const guiWallet = UI_SELECTORS.getSelectedWallet(this._state)
    const coreWallet = CORE_SELECTORS.getWallet(this._state, guiWallet.id)
    const result = await coreWallet.parseUri(uri)
    const info: GuiMakeSpendInfo = {
      currencyCode: result.currencyCode,
      nativeAmount: result.nativeAmount,
      publicAddress: result.publicAddress
    }

    if (options && options.currencyCode) {
      info.currencyCode = options.currencyCode
    }
    if (options && options.customNetworkFee) {
      info.customNetworkFee = options.customNetworkFee
    }
    if (options && options.metadata) {
      info.metadata = options.metadata
    }
    if (options && options.lockInputs) {
      info.lockInputs = options.lockInputs
    }
    if (options && options.uniqueIdentifier) {
      info.uniqueIdentifier = options.uniqueIdentifier
    }

    const transaction = await this._makeSpendRequest(info)
    if (transaction) {
      Actions.pop()

      const exchangeAmount = await coreWallet.nativeToDenomination(transaction.nativeAmount, transaction.currencyCode)
      trackConversion('EdgeProviderConversion', {
        pluginId: this._pluginId,
        account: CORE_SELECTORS.getAccount(this._state),
        currencyCode: transaction.currencyCode,
        exchangeAmount: Number(bns.abs(exchangeAmount))
      })
    }
    return transaction
  }

  // log body and signature and pubic address and final message (returned from signMessage)
  // log response afterwards line 451
  async signMessage (message: string) /* EdgeSignedMessage */ {
    console.log(`signMessage message:***${message}***`)
    const guiWallet = UI_SELECTORS.getSelectedWallet(this._state)
    const coreWallet = CORE_SELECTORS.getWallet(this._state, guiWallet.id)
    const signedMessage = await coreWallet.otherMethods.signMessageBase64(message, guiWallet.receiveAddress.publicAddress)
    console.log(`signMessage public address:***${guiWallet.receiveAddress.publicAddress}***`)
    console.log(`signMessage signedMessage:***${signedMessage}***`)
    return signedMessage
  }

  async _makeSpendRequest (guiMakeSpendInfo: GuiMakeSpendInfo): Promise<EdgeTransaction | void> {
    const edgeTransaction: EdgeTransaction | void = await this._spend(guiMakeSpendInfo)

    const { metadata } = guiMakeSpendInfo
    if (metadata != null && edgeTransaction != null) {
      const guiWallet = UI_SELECTORS.getSelectedWallet(this._state)
      const coreWallet = CORE_SELECTORS.getWallet(this._state, guiWallet.id)
      await coreWallet.saveTxMetadata(edgeTransaction.txid, edgeTransaction.currencyCode, metadata)
    }
    return edgeTransaction
  }

  async trackConversion (opts?: { currencyCode: string, exchangeAmount: number }) {
    if (opts != null) {
      const { currencyCode, exchangeAmount } = opts
      trackConversion('EdgeProviderConversion', {
        pluginId: this._pluginId,
        account: CORE_SELECTORS.getAccount(this._state),
        currencyCode,
        exchangeAmount
      })
    } else {
      this._dispatch(
        trackAccountEvent('EdgeProviderConversion', {
          pluginId: this._pluginId
        })
      )
    }
  }

  _spend (guiMakeSpendInfo: GuiMakeSpendInfo, lockInputs: boolean = true, signOnly: boolean = false): Promise<EdgeTransaction | void> {
    return new Promise((resolve, reject) => {
      if (signOnly) {
        reject(new Error('not implemented'))
      }
      guiMakeSpendInfo.onDone = (error: Error | null, edgeTransaction?: EdgeTransaction) => {
        error ? reject(error) : resolve(edgeTransaction)
      }
      guiMakeSpendInfo.onBack = () => {
        resolve()
      }
      guiMakeSpendInfo.lockInputs = true
      Actions[SEND_CONFIRMATION]({ guiMakeSpendInfo })
    })
  }

  hasSafariView (): Promise<boolean> {
    return SafariView.isAvailable()
  }

  // window.fetch.catch(console log then throw)
  async deprecatedAndNotSupportedDouble (request: Object, firstURL: string, url2: string): Promise<mixed> {
    console.log('Bity firstURL: ' + firstURL)
    const response = await window.fetch(firstURL, request).catch(e => {
      console.log(`throw from fetch firstURL: ${firstURL}`, e)
      throw e
    })
    console.log('Bity response1: ', response)
    if (response.status !== 201) {
      const errorData = await response.json()
      throw new Error(errorData.errors[0].code + ' ' + errorData.errors[0].message)
    }
    const secondURL = url2 + response.headers.get('Location')
    console.log('Bity secondURL: ', secondURL)
    const request2 = {
      method: 'GET',
      credentials: 'include'
    }
    const response2 = await window.fetch(secondURL, request2).catch(e => {
      console.log(`throw from fetch secondURL: ${secondURL}`, e)
      throw e
    })
    console.log('Bity response2: ', response2)
    if (response2.status !== 200) {
      throw new Error('Problem confirming order: Code n200')
    }
    const orderData = await response2.json()
    console.log('Bity orderData: ', orderData)
    if (orderData.message_to_sign) {
      const { signature_submission_url, body } = orderData.message_to_sign
      const signedTransaction = await this.signMessage(body)
      const thirdURL = url2 + signature_submission_url
      const request = {
        method: 'POST',
        headers: {
          Host: 'exchange.api.bity.com',
          'Content-Type': '*/*'
        },
        body: signedTransaction
      }
      console.log('Bity thirdURL: ' + thirdURL)
      const signedTransactionResponse = await window.fetch(thirdURL, request).catch(e => {
        console.log(`throw from fetch thirdURL: ${thirdURL}`, e)
        throw e
      })
      console.log('Bity signedTransactionResponse: ', signedTransactionResponse)
      if (signedTransactionResponse.status === 400) {
        throw new Error('Could not complete transaction. Code: 470')
      }
      if (signedTransactionResponse.status === 204) {
        const bankDetailsRequest = {
          method: 'GET',
          credentials: 'include'
        }
        const detailUrl = firstURL + '/' + orderData.id
        console.log('detailURL: ' + detailUrl)
        const bankDetailResponse = await window.fetch(detailUrl, bankDetailsRequest).catch(e => {
          console.log(`throw from fetch detailUrl: ${detailUrl}`, e)
          throw e
        })
        if (bankDetailResponse.status === 200) {
          const parsedResponse = await bankDetailResponse.json()
          console.log('Bity parsedResponse: ', parsedResponse)
          return parsedResponse
        }
      }
    }
    return orderData
  }

  async openSafariView (url: string): Promise<mixed> {
    SafariView.show({ url })
  }
  async displayError (error: Error | string) {
    showError(error)
  }
  async displayToast (arg: string) {
    showToast(arg)
  }
}
