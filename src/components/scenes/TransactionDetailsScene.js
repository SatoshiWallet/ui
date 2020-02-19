// @flow

import { bns } from 'biggystring'
import dateformat from 'dateformat'
import type { EdgeCurrencyInfo, EdgeDenomination, EdgeMetadata, EdgeTransaction } from 'edge-core-js'
import React, { Component, Fragment } from 'react'
import { Animated, Easing, Keyboard, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import slowlog from 'react-native-slowlog'
import { sprintf } from 'sprintf-js'

import { intl } from '../../locales/intl'
import s from '../../locales/strings.js'
import FormattedText from '../../modules/UI/components/FormattedText/index'
import { PayeeIcon } from '../../modules/UI/components/PayeeIcon/PayeeIcon.ui.js'
import styles, { styles as styleRaw } from '../../styles/scenes/TransactionDetailsStyle'
import THEME from '../../theme/variables/airbitz'
import type { GuiContact, GuiWallet } from '../../types/types.js'
import { scale } from '../../util/scaling.js'
import { autoCorrectDate, getFiatSymbol, getWalletDefaultDenomProps, inputBottomPadding, isCryptoParentCurrency } from '../../util/utils'
import ContactSearchResults from '../common/ContactSearchResults.js'
import { launchModal } from '../common/ModalProvider.js'
import { SceneWrapper } from '../common/SceneWrapper.js'
import AmountArea from '../common/TransactionDetailAmountArea.js'
import SubCategorySelect from '../common/TransactionSubCategorySelect.js'
import { createAdvancedTransactionDetailsModal } from '../modals/AdvancedTransactionDetailsModal.js'
import { showError } from '../services/AirshipInstance.js'

const EXCHANGE_TEXT = s.strings.fragment_transaction_exchange
const EXPENSE_TEXT = s.strings.fragment_transaction_expense
const TRANSFER_TEXT = s.strings.fragment_transaction_transfer
const INCOME_TEXT = s.strings.fragment_transaction_income

const categories = {
  exchange: {
    color: styleRaw.typeExchange.color,
    syntax: EXCHANGE_TEXT,
    key: 'exchange'
  },
  expense: {
    color: styleRaw.typeExpense.color,
    syntax: EXPENSE_TEXT,
    key: 'expense'
  },
  transfer: {
    color: styleRaw.typeTransfer.color,
    syntax: TRANSFER_TEXT,
    key: 'transfer'
  },
  income: {
    color: styleRaw.typeIncome.color,
    syntax: INCOME_TEXT,
    key: 'income'
  }
}

export type TransactionDetailsOwnProps = {
  edgeTransaction: EdgeTransaction,
  contacts: Array<GuiContact>,
  subcategoriesList: Array<string>,
  settings: Object, // TODO: This badly needs to get typed but it is a huge dynamically generated object with embedded maps -paulvp,
  thumbnailPath: string,
  currencyInfo: EdgeCurrencyInfo | null,
  currencyCode: string,
  wallets: { [walletId: string]: GuiWallet }
}

export type TransactionDetailsDispatchProps = {
  setNewSubcategory: (string, Array<string>) => void,
  setTransactionDetails: (transaction: EdgeTransaction, edgeMetadata: EdgeMetadata) => void,
  getSubcategories: () => void
}

type State = {
  payeeName: string, // remove commenting once metaData in Redux
  thumbnailPath: string,
  // hasThumbnail: boolean,
  notes: string,
  amountFiat: string,
  direction: string,
  bizId: number,
  miscJson: any, // core receives this as a string
  displayDate: string,
  subCategorySelectVisibility: boolean,
  categorySelectVisibility: boolean,
  category: string,
  subCategory: string,
  contactSearchVisibility: boolean,
  payeeOpacity: any, // AnimatedValue
  subcategoryOpacity: any, // AnimatedValue
  payeeZIndex: number,
  subcatZIndex: number,
  walletDefaultDenomProps: EdgeDenomination
}

type TransactionDetailsProps = TransactionDetailsOwnProps & TransactionDetailsDispatchProps

export class TransactionDetails extends Component<TransactionDetailsProps, State> {
  guiWallet: GuiWallet
  fiatSymbol: string

  constructor (props: TransactionDetailsProps) {
    super(props)
    const edgeTransaction = {
      ...props.edgeTransaction,
      date: autoCorrectDate(props.edgeTransaction.date)
    }
    const displayDate = dateformat(edgeTransaction.date * 1000, 'mmm dS, yyyy, h:MM:ss TT')
    let category = ''
    let subCategory = ''
    let fullCategory = ''
    let payeeName = ''
    let amountFiat = intl.formatNumber('0.00')
    let notes = ''
    const direction = parseInt(edgeTransaction.nativeAmount) >= 0 ? 'receive' : 'send'
    if (edgeTransaction.wallet) {
      this.guiWallet = props.wallets[edgeTransaction.wallet.id]
      this.fiatSymbol = getFiatSymbol(this.guiWallet.fiatCurrencyCode)
    } else {
      showError(s.strings.transaction_detail_unable_to_load_transaction)
    }

    if (edgeTransaction && edgeTransaction.metadata) {
      fullCategory = edgeTransaction.metadata.category ? edgeTransaction.metadata.category : ''
      payeeName = edgeTransaction.metadata.name ? edgeTransaction.metadata.name : '' // remove commenting once metaData in Redux
      notes = edgeTransaction.metadata.notes ? edgeTransaction.metadata.notes : ''
      if (edgeTransaction.metadata.amountFiat) {
        const initial = edgeTransaction.metadata.amountFiat.toFixed(2)
        const absoluteAmountFiat = bns.abs(initial)
        amountFiat = intl.formatNumber(bns.toFixed(absoluteAmountFiat, 2, 2), { noGrouping: true })
      }
    }

    // if there is a user-entered category (type:subcategory)
    if (fullCategory) {
      const colonOccurrence = fullCategory.indexOf(':')
      if (fullCategory && colonOccurrence) {
        category = fullCategory.substring(0, colonOccurrence)
        category = category.charAt(0).toLowerCase() + category.slice(1)
        subCategory = fullCategory.substring(colonOccurrence + 1, fullCategory.length)
      }
    }

    // if type is still not defined then figure out if send or receive (expense vs income)
    if (!category || !categories[category]) {
      if (direction === 'receive') {
        category = categories.income.key
      } else {
        category = categories.expense.key
      }
    } else {
      category = categories[category].key
    }

    this.state = {
      payeeName,
      notes,
      thumbnailPath: props.thumbnailPath,
      category: category,
      amountFiat,
      bizId: 0,
      direction,
      miscJson: edgeTransaction.metadata ? edgeTransaction.metadata.miscJson : '',
      displayDate,
      subCategorySelectVisibility: false,
      categorySelectVisibility: false,
      subCategory: subCategory || '',
      contactSearchVisibility: false,
      payeeOpacity: new Animated.Value(0),
      subcategoryOpacity: new Animated.Value(0),
      payeeZIndex: 0,
      subcatZIndex: 0,
      walletDefaultDenomProps: {
        name: '',
        multiplier: '',
        symbol: ''
      },
      isAdvancedTransactionDetailsModalVisible: false
    }
    slowlog(this, /.*/, global.slowlogOptions)
  }

  onFocusPayee = () => {
    this.enablePayeeVisibility()
    this.refs._scrollView.scrollTo({ x: 0, y: 62, animated: true })
  }

  onBlurPayee = () => {
    this.disablePayeeVisibility()
    Keyboard.dismiss()
    this.refs._scrollView.scrollTo({ x: 0, y: 0, animated: true })
  }

  enablePayeeVisibility = () => {
    const toOpacity = 1
    this.setState({ contactSearchVisibility: true, payeeZIndex: 99999 }, () => {
      Animated.timing(this.state.payeeOpacity, {
        toValue: toOpacity,
        easing: Easing.ease,
        duration: 200,
        delay: 0,
        useNativeDriver: true
      }).start()
    })
  }

  disablePayeeVisibility = () => {
    this.state.payeeOpacity.setValue(0)
    this.setState({
      contactSearchVisibility: false,
      payeeZIndex: 0
    })
  }

  onChangePayee = (contactName: string, thumbnailPath: string) => {
    this.setState({
      payeeName: contactName,
      thumbnailPath: thumbnailPath
    })
  }

  onSelectPayee = (payeeName: string, thumbnail: string) => {
    this.onChangePayee(payeeName, thumbnail)
    this.onBlurPayee()
    this.refs._scrollView.scrollTo({ x: 0, y: 0, animated: true })
  }

  onChangeFiat = (input: string) => {
    // This next chained statement / expression is to ensure only one decimal place. Remember decimals are commas in some locales
    // double-check that this implementation change works!
    const newInputStripped = input
      .replace(/[^\d.,]/, '')
      .replace(/\./, 'x')
      .replace(/\./g, '')
      .replace(/x/, '.')
      .replace(/,/, 'x')
      .replace(/,/g, '')
      .replace(/x/, ',')
    const newInputFiltered =
      (isNaN(newInputStripped.replace(',', '.')) && (newInputStripped !== ',' && newInputStripped !== '.')) || newInputStripped === '' ? '' : newInputStripped
    this.setState({
      amountFiat: newInputFiltered
    })
  }

  onBlurFiat = () => {
    // needs badly to be flowed and / or research best practices for converting TextInput to float / fiat
    // keep in mind that TextField returns a string, and amountFiat will need to be a floating point number
    let amountFiat
    if (parseFloat(this.state.amountFiat)) {
      const amountFiatOneDecimal = this.state.amountFiat.toString().replace(/[^\d.,]/, '')
      const absoluteAmountFiatOneDecimal = bns.abs(amountFiatOneDecimal)
      amountFiat = bns.toFixed(absoluteAmountFiatOneDecimal, 2, 2)
    } else {
      amountFiat = intl.formatNumber('0.00')
    }
    this.setState({
      amountFiat
    })
  }

  onChangeCategory = (input: string) => {
    this.setState({
      category: input
    })
  }

  onChangeSubcategory = (input: string) => {
    this.setState({
      subCategory: input
    })
  }

  onChangeNotes = (input: string) => {
    this.setState({
      notes: input
    })
  }

  onFocusNotes = () => {
    this.refs._scrollView.scrollTo({ x: 0, y: 300, animated: true })
  }

  onBlurNotes = () => {
    Keyboard.dismiss()
    this.refs._scrollView.scrollTo({ x: 0, y: 0, animated: true })
  }

  onNotesKeyboardReturn = () => {
    this.onBlurNotes()
  }

  onEnterCategories = () => {
    this.setState({ categorySelectVisibility: true })
  }

  onExitCategories = () => {
    this.setState({ categorySelectVisibility: false })
  }

  onEnterSubcategories = () => {
    this.refs._scrollView.scrollTo({ x: 0, y: 260, animated: true })
    this.enableSubcategoryVisibility()
  }

  onExitSubcategories = () => {
    // this.disableSubcategoryVisibility()
  }

  enableSubcategoryVisibility = () => {
    const toOpacity = 1
    this.setState({ subCategorySelectVisibility: true, subcatZIndex: 99999 }, () => {
      Animated.timing(this.state.subcategoryOpacity, {
        toValue: toOpacity,
        easing: Easing.ease,
        duration: 200,
        delay: 100,
        useNativeDriver: true
      }).start()
    })
  }

  disableSubcategoryVisibility = () => {
    this.state.subcategoryOpacity.setValue(0)
    this.setState({
      subCategorySelectVisibility: false,
      subcatZIndex: 0
    })
  }

  onSubcategoriesKeyboardReturn = () => {
    this.disableSubcategoryVisibility()
    this.refs._scrollView.scrollTo({ x: 0, y: 0, animated: true })
  }

  onSelectSubCategory = (input: string) => {
    let stringArray
    // check if there is a colon that delineates category and subcategory
    if (!input) {
      this.setState({
        subCategory: ''
      })
    } else {
      // if input *does* exist
      const colonOccurrence = input.indexOf(':')
      if (colonOccurrence) {
        // if it *does* have a colon in it
        stringArray = [input.substring(0, colonOccurrence), input.substring(colonOccurrence + 1, input.length)]
        // console.log('stringArray is: ', stringArray)
        if (Object.keys(categories).indexOf(stringArray[0].toLowerCase()) >= 0) {
          // if the type is of the 4 options
          this.setState({
            category: stringArray[0].toLowerCase(),
            subCategory: stringArray[1]
          })

          if (this.props.subcategoriesList.indexOf(input) === -1) {
            // if this is a new subcategory
            this.addNewSubcategory(input)
          }
        } else {
          this.setState({
            subCategory: stringArray[1]
          })
        }
      } else {
        this.setState({
          subCategory: ''
        })
      }
    }
    this.disableSubcategoryVisibility()
    Keyboard.dismiss()
    this.refs._scrollView.scrollTo({ x: 0, y: 0, animated: true })
  }

  addNewSubcategory = (newSubcategory: string) => {
    this.props.setNewSubcategory(newSubcategory, this.props.subcategoriesList)
  }

  onFocusFiatAmount = () => {
    const { amountFiat } = this.state
    if (amountFiat === '0.00' || amountFiat === '0,00') {
      this.setState({
        amountFiat: ''
      })
    }
    this.refs._scrollView.scrollTo({ x: 0, y: 90, animated: true })
  }

  onPressAdvancedDetailsButton = async () => {
    const { edgeTransaction } = this.props
    let txExplorerLink = null
    if (this.props.currencyInfo) {
      txExplorerLink = sprintf(this.props.currencyInfo.transactionExplorer, this.props.edgeTransaction.txid)
    }

    const modal = createAdvancedTransactionDetailsModal({
      txExplorerUrl: txExplorerLink,
      ...edgeTransaction
    })
    await launchModal(modal)
  }

  onSaveTxDetails = () => {
    const { payeeName, notes, bizId, miscJson, category, subCategory, amountFiat } = this.state
    const { edgeTransaction } = this.props
    let fullCategory, finalAmountFiat
    if (category) {
      fullCategory = category.charAt(0).toUpperCase() + category.slice(1) + ':' + subCategory
    } else {
      fullCategory = undefined
    }
    const decimalAmountFiat = Number.parseFloat(amountFiat.replace(',', '.'))
    if (isNaN(decimalAmountFiat)) {
      // if invalid number set to previous saved amountFiat
      finalAmountFiat = edgeTransaction.metadata ? edgeTransaction.metadata.amountFiat : 0.0
    } else {
      // if a valid number or empty string then set to zero (empty) or actual number
      finalAmountFiat = !amountFiat ? 0.0 : decimalAmountFiat
    }
    const edgeMetadata: EdgeMetadata = { name: payeeName, category: fullCategory, notes, amountFiat: finalAmountFiat, bizId, miscJson }
    edgeTransaction.metadata = edgeMetadata
    this.props.setTransactionDetails(edgeTransaction, edgeMetadata)
  }

  componentDidMount () {
    this.props.getSubcategories()
  }

  UNSAFE_componentWillMount () {
    // check if metaToken, is not then do not set walletDefaultProps to anything other than initial blank values
    if (isCryptoParentCurrency(this.guiWallet, this.props.edgeTransaction.currencyCode)) {
      this.setState({ walletDefaultDenomProps: getWalletDefaultDenomProps(this.guiWallet, this.props.settings) })
    } else {
      this.setState({ walletDefaultDenomProps: getWalletDefaultDenomProps(this.guiWallet, this.props.settings, this.props.edgeTransaction.currencyCode) })
    }
  }

  renderPayeeSearch () {
    return (
      <SceneWrapper avoidKeyboard background="none">
        {gap => (
          <Animated.View id="payeeSearchResults" style={[styles.searchPopup, { bottom: -gap.bottom, opacity: this.state.payeeOpacity }]}>
            <View style={styles.payeeNameArea}>
              <View style={styles.payeeNameWrap}>
                <TextInput
                  underlineColorAndroid={'transparent'}
                  autoFocus
                  blurOnSubmit
                  onSubmitEditing={this.onBlurPayee}
                  autoCapitalize="words"
                  autoCorrect={false}
                  onChangeText={this.onChangePayee}
                  style={[styles.payeeNameInput, inputBottomPadding()]}
                  placeholder="Payee"
                  defaultValue={this.state.payeeName}
                  placeholderTextColor={THEME.COLORS.GRAY_2}
                  returnKeyType={'done'}
                />
              </View>
            </View>
            <ContactSearchResults
              bottomGap={gap.bottom}
              onChangePayee={this.onSelectPayee}
              contacts={this.props.contacts}
              currentPayeeText={this.state.payeeName || ''}
              onSelectPayee={this.onSelectPayee}
              blurOnSubmit
              onBlur={this.onBlurPayee}
            />
          </Animated.View>
        )}
      </SceneWrapper>
    )
  }

  renderCategorySearch () {
    const sortedSubcategories = this.props.subcategoriesList.length > 0 ? this.props.subcategoriesList.sort() : []
    const categoryColor = categories[this.state.category].color

    return (
      <SceneWrapper avoidKeyboard background="none">
        {gap => (
          <Animated.View id="subcategorySearchResults" style={[styles.searchPopup, { bottom: -gap.bottom, opacity: this.state.subcategoryOpacity }]}>
            <View style={styles.modalCategoryRow}>
              <TouchableOpacity style={[styles.categoryLeft, { borderColor: categoryColor }]} disabled>
                <FormattedText style={[{ color: categoryColor }, styles.categoryLeftText]}>{categories[this.state.category].syntax}</FormattedText>
              </TouchableOpacity>
              <View style={styles.modalCategoryInputArea}>
                <TextInput
                  underlineColorAndroid={'transparent'}
                  autoFocus
                  blurOnSubmit
                  autoCapitalize="words"
                  onBlur={this.onExitSubcategories}
                  onChangeText={this.onChangeSubcategory}
                  style={[styles.categoryInput, inputBottomPadding()]}
                  defaultValue={this.state.subCategory || ''}
                  placeholder={s.strings.transaction_details_category_title}
                  autoCorrect={false}
                  onSubmitEditing={this.onSubcategoriesKeyboardReturn}
                  placeholderTextColor={THEME.COLORS.GRAY_2}
                  initialNumToRender={8}
                  returnKeyType={'done'}
                />
              </View>
            </View>
            <SubCategorySelect
              bottomGap={gap.bottom}
              onPressFxn={this.onSelectSubCategory}
              enteredSubcategory={this.state.subCategory}
              subcategoriesList={sortedSubcategories}
            />
          </Animated.View>
        )}
      </SceneWrapper>
    )
  }

  render () {
    const categoryColor = categories[this.state.category].color
    let txExplorerLink = null
    if (this.props.currencyInfo) {
      txExplorerLink = sprintf(this.props.currencyInfo.transactionExplorer, this.props.edgeTransaction.txid)
    }

    return (
      <Fragment>
        <SceneWrapper background="body" bodySplit={scale(24)}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            ref="_scrollView"
            scrollEnabled={!this.state.subCategorySelectVisibility}
            overScrollMode="never"
            gradientHeight="50%"
          >
            <View style={styles.container}>
              <PayeeIcon direction={this.state.direction} thumbnailPath={this.state.thumbnailPath} />
              <View style={styles.payeeNameArea}>
                <View style={styles.payeeNameWrap}>
                  <TextInput
                    underlineColorAndroid={'transparent'}
                    autoCapitalize="words"
                    onFocus={this.onFocusPayee}
                    autoCorrect={false}
                    style={[styles.payeeNameInput, inputBottomPadding()]}
                    placeholder={s.strings.transaction_details_payee}
                    defaultValue={this.state.payeeName}
                    placeholderTextColor={THEME.COLORS.GRAY_2}
                  />
                </View>
              </View>
              <View style={styles.payeeSeperator} />
              <View style={styles.dateWrap}>
                <FormattedText style={styles.date}>{this.state.displayDate}</FormattedText>
              </View>
              <AmountArea
                edgeTransaction={this.props.edgeTransaction}
                onChangeNotesFxn={this.onChangeNotes}
                onChangeCategory={this.onChangeCategory}
                onChangeFiatFxn={this.onChangeFiat}
                onBlurFiatFxn={this.onBlurFiat}
                onPressFxn={this.onSaveTxDetails}
                fiatCurrencyCode={this.guiWallet.fiatCurrencyCode}
                cryptoCurrencyCode={this.props.edgeTransaction.currencyCode}
                fiatCurrencySymbol={this.fiatSymbol}
                fiatAmount={this.state.amountFiat}
                onEnterSubcategories={this.onEnterSubcategories}
                subCategorySelectVisibility={this.state.subCategorySelectVisibility}
                categorySelectVisibility={this.state.categorySelectVisibility}
                onSelectSubCategory={this.onSelectSubCategory}
                category={this.state.category}
                subCategory={this.state.subCategory}
                categories={categories}
                onEnterCategories={this.onEnterCategories}
                onExitCategories={this.onExitCategories}
                onSubcategoryKeyboardReturn={this.onSubcategoriesKeyboardReturn}
                onNotesKeyboardReturn={this.onNotesKeyboardReturn}
                onFocusNotes={this.onFocusNotes}
                onBlurNotes={this.onBlurNotes}
                direction={this.state.direction}
                color={categoryColor}
                onFocusFiatAmount={this.onFocusFiatAmount}
                walletDefaultDenomProps={this.state.walletDefaultDenomProps}
                guiWallet={this.guiWallet}
                onPressAdvancedDetailsButton={this.onPressAdvancedDetailsButton}
                txExplorerUrl={txExplorerLink}
              />
            </View>
          </ScrollView>
        </SceneWrapper>
        {this.state.contactSearchVisibility && this.renderPayeeSearch()}
        {this.state.subCategorySelectVisibility && this.renderCategorySearch()}
      </Fragment>
    )
  }
}
