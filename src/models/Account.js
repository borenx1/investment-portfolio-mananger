const defaultAccountSettings = accountSettings(
  asset('United States Dollar', 'USD', 2, 4, true, '$'),
);
const defaultAssets = [
  asset('Bitcoin', 'BTC', 8, 2, true, '₿'),
];
const defaultJournals = [
  journal(
    'Trading',
    'trading',
    [
      transaction('01/01/2021', 'BTC', 1, 'USD', 50000, 0, 20, 'First transaction'),
      transaction('02/01/2021', 'BTC', 0.5, 'USD', 25000, 0, 10, 'Second transaction'),
    ],
    tradingColumns(),
    ['date', 'base', 'baseAmount', 'quote', 'quoteAmount', 'price', 'feeBase', 'feeQuote', 'notes'],
  ),
  journal(
    'Misc fees',
    'expense',
    [],
    expenseColumns(),
    ['date', 'base', 'baseAmount', 'quote', 'quoteAmount', 'price', 'feeBase', 'feeQuote', 'notes'],
  ),
];

/**
 * Account settings.
 * @param {Object} accountingCurrency The accounting currency of the account.
 * @returns An object with the given members.
 */
export function accountSettings(accountingCurrency = asset('United States Dollar', 'USD', '$', 2, 4)) {
  return {accountingCurrency};
}

/**
 * Asset settings.
 * @param {String} name Name of the asset, e.g. Bitcoin.
 * @param {String} ticker Ticker of the asset, e.g. BTC.
 * @param {Number} precision The precision used to record amounts.
 * @param {Number} pricePrecision The default precision used to show prices.
 * @param {Boolean} isCurrency true if the asset is a currency.
 * @param {String} symbol Symbol of the asset, e.g. ₿.
 * @returns An object with the given members.
 */
export function asset(name, ticker, precision = 2, pricePrecision = 2, isCurrency = false, symbol = '') {
  return {name, ticker, precision, pricePrecision, isCurrency, symbol};
}

/**
 * A transaction (trade, income or expense).\
 * An income transaction has positive base and quote amounts.\
 * An expense transaction has negative base and no quote amount.\
 * A trade has opposite base and quote amount signs.
 * @param {Date} date Date of the transaction.
 * @param {String} base Base currency/asset.
 * @param {Number} baseAmount Amount of base changed, i.e. amount.
 * @param {String} quote Quote currency/asset.
 * @param {Number} quoteAmount Amount of quote changed, i.e. total.
 * @param {Number} feeBase Fee in base currency.
 * @param {Number} feeQuote Fee in quote currency.
 * @param {String} notes User written notes.
 * @param {Object[]} misc Extra properties, e.g. [{name: 'Exchange', type: 'string', value: 'NYSE'}].
 * @returns An object with the given members.
 */
export function transaction(
  date,
  base = 'USD',
  baseAmount = 0,
  quote = 'USD',
  quoteAmount = 0,
  feeBase = 0,
  feeQuote = 0,
  notes = '',
  misc = []
) {
  return {date, base, baseAmount, quote, quoteAmount, feeBase, feeQuote, notes, misc};
}

/**
 * A set of journal columns.
 * @param {*} date Date journal column.
 * @param {*} base Base journal column.
 * @param {*} baseAmount Base amount journal column.
 * @param {*} quote Quote journal column.
 * @param {*} quoteAmount Quote amount journal column.
 * @param {*} price Price journal column.
 * @param {*} feeBase Fee in base curreny journal column.
 * @param {*} feeQuote Fee in quote curreny journal column.
 * @param {*} notes Notes journal column.
 * @param {*} extra Extra journal columns.
 * @returns An object with the given members.
 */
export function journalColumnSet(date, base, baseAmount, quote, quoteAmount, price, feeBase, feeQuote, notes, extra = []) {
  return {
    date, base, baseAmount, quote, quoteAmount, price, feeBase, feeQuote, notes, extra,
  };
}

export function tradingColumns(dateTimeFormat = 'date') {
  return journalColumnSet(
    journalColumn('Date', 'date', false, undefined, dateTimeFormat),
    journalColumn('Asset', 'string', false),
    journalColumn('Amount', 'number', false, 8),
    journalColumn('Quote', 'string', true),
    journalColumn('Total', 'number', false, 2),
    journalColumn('Price', 'number', false, 2),
    journalColumn('Fee (Base)', 'number', true, 8),
    journalColumn('Fee', 'number', false, 2),
    journalColumn('Notes', 'string', false),
  );
}

export function incomeColumns(dateTimeFormat = 'date') {
  return journalColumnSet(
    journalColumn('Date', 'date', false, undefined, dateTimeFormat),
    journalColumn('Asset', 'string', false),
    journalColumn('Amount', 'number', false, 2),
    journalColumn('Quote', 'string', true),
    journalColumn('Total', 'number', true, 2),
    journalColumn('Price', 'number', true, 2),
    journalColumn('Fee (Base)', 'number', true, 8),
    journalColumn('Fee', 'number', true, 2),
    journalColumn('Notes', 'string', false),
  );
}

export function expenseColumns(dateTimeFormat = 'date') {
  return journalColumnSet(
    journalColumn('Date', 'date', false, undefined, dateTimeFormat),
    journalColumn('Asset', 'string', false),
    journalColumn('Amount', 'number', false, 2),
    journalColumn('Quote', 'string', true),
    journalColumn('Total', 'number', true, 2),
    journalColumn('Price', 'number', true, 2),
    journalColumn('Fee (Base)', 'number', true, 8),
    journalColumn('Fee', 'number', true, 2),
    journalColumn('Notes', 'string', false),
  );
}

/**
 * Journal column settings.
 * @param {String} name Name of the column.
 * @param {String} type Type of column, one of: 'date', 'string', 'number', 'integer'.
 * @param {Boolean} hide Hide the column if true.
 * @param {Number} precision Precision of the column if the type is 'number'.
 * @param {String} dateTimeFormat Date time format if the type is 'date', one of: 'date', 'time', 'datetime'.
 * @returns An object with the given members.
 */
export function journalColumn(name, type, hide = false, precision = 2, dateTimeFormat = 'date') {
  return {name, type, hide, precision, dateTimeFormat};
}

/**
 * A journal for an account.
 * @param {String} name Name of the journal.
 * @param {String} type Type of the journal, one of: 'trading', 'income', 'expense'.
 * @param {Object[]} transactions List of transactions.
 * @param {Object} columns Mapping of columns and their settings.
 * @param {String[]} columnOrder The shown order of the columns.
 * @returns An object with the given members.
 */
export function journal(name, type = 'trading', transactions = [], columns = {}, columnOrder = []) {
  return {name, type, transactions, columns, columnOrder};
}

/**
 * A trading account.
 * @param {String} name Name of the account.
 * @param {Object} settings Account settings.
 * @param {Object[]} assets Managed assets of the account.
 * @param {Object[]} journals List of Transaction journals.
 * @returns An object with the given members.
 */
export function account(name, settings = defaultAccountSettings, assets = defaultAssets, journals = defaultJournals,) {
  return {name, settings, assets, journals};
}