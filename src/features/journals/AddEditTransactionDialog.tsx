import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import BigNumber from 'bignumber.js';
import AddEditDialog from '../../components/AddEditDialog';
import { addTransaction, editTransaction, selectActiveAccount, selectActiveAccountAssetsAll, selectActiveAccountJournals } from '../accounts/accountsSlice';
import { dateToString, getDecimalColumnPrecision, journalColumnRoleDisplay } from '../../models/account';
import { roundDown } from '../../models/math';

type TransactionType = 'buy' | 'sell' | 'income' | 'expense';

function getTransactionType(baseAmount: number, quoteAmount: number, defaultType: TransactionType) {
  if (baseAmount > 0 && quoteAmount < 0) {
    return 'buy';
  } else if (baseAmount < 0 && quoteAmount > 0) {
    return 'sell';
  } else if (baseAmount > 0 && quoteAmount >= 0) {
    return 'income';
  } else if (baseAmount < 0 && quoteAmount <= 0) {
    return 'expense';
  }
  return defaultType;
}

function fromTransactionType(baseAmount: number, quoteAmount: number, type: TransactionType): [number, number] {
  switch (type) {
    case 'buy':
      return [Math.abs(baseAmount), -Math.abs(quoteAmount)];
    case 'sell':
      return [-Math.abs(baseAmount), Math.abs(quoteAmount)];
    case 'income':
      return [Math.abs(baseAmount), Math.abs(quoteAmount)];
    case 'expense':
      return [-Math.abs(baseAmount), -Math.abs(quoteAmount)];
  }
}

export interface FormFields {
  date: Date;
  base: string;
  quote: string;
  baseAmount: BigNumber,
  quoteAmount: BigNumber,
  price: BigNumber,
  type: TransactionType;
  fee: BigNumber,
  feeCurrency: 'base' | 'quote',
  notes: string,
}

const initialFormFields: FormFields = {
  date: new Date(),
  base: '',
  quote: '',
  baseAmount: new BigNumber(NaN),
  quoteAmount: new BigNumber(NaN),
  price: new BigNumber(NaN),
  type: 'buy',
  fee: new BigNumber(NaN),
  feeCurrency: 'quote',
  notes: '',
};

interface Props {
  journal: number;
  transaction: number;
  open: boolean;
  onDialogClose?: () => void;
}

function AddEditTransactionDialog(props: Props) {
  const { journal: journalIndex, transaction: transactionIndex, open, onDialogClose } = props;
  const [fields, setFields] = useState<FormFields>(initialFormFields);
  const dispatch = useDispatch();
  const account = useSelector(selectActiveAccount);
  const journal = useSelector(selectActiveAccountJournals)[journalIndex];
  const transaction = journal?.transactions[transactionIndex];
  const assets = useSelector(selectActiveAccountAssetsAll);
  
  const basePrecision = journal ? getDecimalColumnPrecision(journal.columns['baseAmount'], fields.base, fields.quote, assets) : NaN;
  const quotePrecision = journal ? getDecimalColumnPrecision(journal.columns['quoteAmount'], fields.base, fields.quote, assets) : NaN;

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'baseAmount') {
      setFields(s => {
        const newFields = {...s, baseAmount: roundDown(BigNumber.max(e.target.value, 0), basePrecision)};
        if (s.price.toNumber()) {
          newFields.quoteAmount = roundDown(newFields.baseAmount.times(s.price), quotePrecision);
        }
        return newFields;
      });
    } else if (e.target.name === 'quoteAmount') {
      setFields(s => {
        const newFields = {...s, quoteAmount: roundDown(BigNumber.max(e.target.value, 0), quotePrecision)};
        if (s.baseAmount.toNumber()) {
          newFields.price = newFields.quoteAmount.div(s.baseAmount);
        }
        return newFields;
      });
    } else if (e.target.name === 'price') {
      setFields(s => {
        const newFields = {...s, price: BigNumber.max(e.target.value, 0)};
        if (s.baseAmount.toNumber()) {
          newFields.quoteAmount = roundDown(newFields.price.times(s.baseAmount), quotePrecision)
        }
        return newFields;
      });
    }
  };

  const resetForm = () => {
    if (transaction === null || transaction === undefined) {
      // Add
      setFields({
        ...initialFormFields,
        date: new Date(),
        base: account?.assets[0]?.ticker ?? account?.settings.accountingCurrency.ticker ?? '',
        quote: account?.settings.accountingCurrency.ticker ?? '',
      });
    } else {
      // Edit
      setFields({
        date: new Date(transaction.date),
        base: transaction.base,
        baseAmount: new BigNumber(transaction.baseAmount).abs(),
        quote: transaction.quote,
        quoteAmount: new BigNumber(transaction.quoteAmount).abs(),
        price: new BigNumber(transaction.quoteAmount).div(new BigNumber(transaction.baseAmount)).abs(),
        type: getTransactionType(transaction.baseAmount, transaction.quoteAmount, 'buy'),
        fee: transaction.feeBase !== 0 ? new BigNumber(transaction.feeBase) : new BigNumber(transaction.feeQuote),
        feeCurrency: transaction.feeBase !== 0 ? 'base' : 'quote',
        notes: transaction.notes,
      });
    }
  };

  const handleSubmit = () => {
    // TODO input validation
    const [newBaseAmount, newQuoteAmount] = fromTransactionType(fields.baseAmount.toNumber(), fields.quoteAmount.toNumber(), fields.type);
    const newTransaction = {
      date: dateToString(fields.date),
      base: fields.base,
      baseAmount: newBaseAmount,
      quote: fields.quote,
      quoteAmount: newQuoteAmount,
      feeBase: fields.feeCurrency === 'base' ? fields.fee.toNumber() : 0,
      feeQuote: fields.feeCurrency === 'quote' ? fields.fee.toNumber() : 0,
      notes: fields.notes,
      extra: {},
    };
    if (transaction === null || transaction === undefined) {
      // Add
      dispatch(addTransaction({
        journal: journalIndex,
        transaction: newTransaction,
      }));
    } else {
      // Edit
      dispatch(editTransaction({
        journal: journalIndex,
        index: transactionIndex,
        transaction: newTransaction,
      }));
    }
    onDialogClose?.();
  };

  return (
    <AddEditDialog
      objectName="Transaction"
      edit={Boolean(transaction)}
      open={open}
      onClose={onDialogClose}
      onEnter={resetForm}
      onReset={resetForm}
      onSubmit={handleSubmit}
      contentMaxWidth="30rem"
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            type={journal?.columns.date.showTime ? "datetime-local" : "date"}
            size="small"
            label={journal?.columns.date.name ?? journalColumnRoleDisplay('date')}
            fullWidth
            required
            inputProps={{step: 1}}
            value={dateToString(fields.date, journal?.columns.date.showTime)}
            onChange={(e) => setFields(s => ({...s, date: new Date(e.target.value)}))}
            InputLabelProps={{shrink: true}}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            type="number"
            name="baseAmount"
            fullWidth
            size="small"
            label={journal?.columns.baseAmount.name ?? journalColumnRoleDisplay('baseAmount')}
            required
            helperText={fields.base && `${basePrecision} max decimal places`}
            value={fields.baseAmount.isFinite() ? fields.baseAmount.toFixed() : ''}
            inputProps={{min: 0, step: fields.base ? 1/Math.pow(10, basePrecision) : 1}}
            onChange={handleFieldChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            select
            fullWidth
            size="small"
            label={journal?.columns.base.name ?? journalColumnRoleDisplay('base')}
            required
            value={fields.base}
            onChange={(e) => setFields(s => ({...s, base: e.target.value}))}
          >
            {assets.map((a) => (
              <MenuItem value={a.ticker} key={a.ticker}>{ a.ticker }</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={8}>
          <TextField
            type="number"
            name="quoteAmount"
            fullWidth
            size="small"
            label={journal?.columns.quoteAmount.name ?? journalColumnRoleDisplay('quoteAmount')}
            required
            helperText={fields.quote && `${quotePrecision} max decimal places`}
            value={fields.quoteAmount.isFinite() ? fields.quoteAmount.toFixed() : ''}
            inputProps={{min: 0, step: fields.quote ? 1/Math.pow(10, quotePrecision) : 1}}
            onChange={handleFieldChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            select
            fullWidth
            size="small"
            label={journal?.columns.quote.name ?? journalColumnRoleDisplay('quote')}
            required
            value={fields.quote}
            onChange={(e) => setFields(s => ({...s, quote: e.target.value}))}
          >
            {assets.map((a) => (
              <MenuItem value={a.ticker} key={a.ticker}>{ a.ticker }</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={8}>
          <TextField
            type="number"
            name="price"
            fullWidth
            size="small"
            label={journal?.columns.price.name ?? journalColumnRoleDisplay('price')}
            required
            value={fields.price.isFinite() ? fields.price.toFixed() : ''}
            onChange={handleFieldChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Type"
            required
            value={fields.type}
            onChange={(e) => setFields(s => ({...s, type: e.target.value as TransactionType}))}
          >
            <MenuItem value={'buy'}>Buy</MenuItem>
            <MenuItem value={'sell'}>Sell</MenuItem>
            <MenuItem value={'income'}>Income</MenuItem>
            <MenuItem value={'expense'}>Expense</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={8}>
          <TextField
            type="number"
            fullWidth
            size="small"
            label="Fee"
            value={fields.fee.isFinite() ? fields.fee.toFixed() : ''}
            inputProps={{min: 0, step: fields.feeCurrency === 'base' ?
              (fields.base ? 1/Math.pow(10, basePrecision) : 1) :
              (fields.quote ? 1/Math.pow(10, quotePrecision) : 1)
            }}
            helperText={
              fields.feeCurrency === 'base' ?
              (fields.base && `${basePrecision} max decimal places`) :
              (fields.quote && `${quotePrecision} max decimal places`)
            }
            onChange={(e) => setFields(s => ({
              ...s,
              fee: roundDown(BigNumber.max(e.target.value, 0), fields.feeCurrency === 'base' ? basePrecision : quotePrecision),
            }))}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Fee Currency"
            value={fields.feeCurrency}
            onChange={(e) => setFields(s => ({...s, feeCurrency: e.target.value as 'base' | 'quote'}))}
          >
            <MenuItem value={'base'}>{ `Base (${fields.base})` }</MenuItem>
            <MenuItem value={'quote'}>{ `Quote (${fields.quote})` }</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            multiline
            fullWidth
            size="small"
            variant="outlined"
            label={journal?.columns.notes.name ?? journalColumnRoleDisplay('notes')}
            value={fields.notes}
            onChange={(e) => setFields(s => ({...s, notes: e.target.value}))}
          />
        </Grid>
      </Grid>
    </AddEditDialog>
  );
}

export default AddEditTransactionDialog;