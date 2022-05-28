import { Decimal128, ObjectId } from "mongodb";
import {
  deserializeDate,
  deserializeDecimal,
  deserializeId,
  serializeDate,
  serializeDecimal,
  serializeId,
} from "../serialization.server";
import { transformRecord } from "../util";
import { PeriodType } from "./enums";
import {
  IncomeExpenseRefModel,
  IncomeExpensesSectionModel,
  PeriodModel,
  ProfitOrLossEntryModel,
  TransferProfitOrLossSectionModel,
  ValueProfitOrLossSectionModel,
} from "./model.server";

export interface Period<TType extends PeriodType = PeriodType> {
  _id: Date;
  type: TType;
  profits: readonly ProfitOrLossEntry<"income">[];
  losses: readonly ProfitOrLossEntry<"expense">[];
  income: IncomeExpensesSection;
  expenses: IncomeExpensesSection;
  transferProfitOrLoss: TransferProfitOrLossSection;
  valueProfitOrLoss: ValueProfitOrLossSection;
  profitOrLoss: Decimal128;
  cashFlow: Decimal128;
}

export interface ProfitOrLossEntry<
  IncomeOrExpense extends "income" | "expense" = "income" | "expense"
> {
  type: IncomeOrExpense | "value" | "transfers";
  categoryId?: ObjectId;
  amount: Decimal128;
}

export interface IncomeExpensesSection {
  categories: {
    [categoryId: string]: {
      bookings: readonly IncomeExpenseRef[];
      total: Decimal128;
    };
  };
  total: Decimal128;
}

export interface IncomeExpenseRef {
  transactionId: ObjectId;
  date: Date;
  transactionNote?: string;
  bookingNote?: string;
  currency: string;
  amount: Decimal128;
  amountInReferenceCurrency: Decimal128;
}

export interface ValueProfitOrLossSection {
  stocks: { [stockId: string]: Decimal128 };
  currencies: { [currency: string]: Decimal128 };
  valuatedAccounts: { [accountId: string]: Decimal128 };
  accountCategories: { [accountCategories: string]: Decimal128 };
  accounts: { [accountId: string]: Decimal128 };
  valueTypes: { [valueTypeId: string]: Decimal128 };
  valueSubtypes: { [valueSubtypeId: string]: Decimal128 };
  total: Decimal128;
}

export interface TransferProfitOrLossSection {
  transfers: {
    [transactionId: string]: Decimal128;
  };
  total: Decimal128;
}

export type MonthPeriod = Period<PeriodType.MONTH>;
export type QuarterPeriod = Period<PeriodType.QUARTER>;
export type YearPeriod = Period<PeriodType.YEAR>;

function serializeIncomeExpensesSection(
  model: IncomeExpensesSectionModel
): IncomeExpensesSection {
  return {
    categories: transformRecord(model.categories, (c) => ({
      bookings: c.bookings.map(serializeIncomeExpenseRef),
      total: serializeDecimal(c.total),
    })),
    total: serializeDecimal(model.total),
  };
}

function serializeIncomeExpenseRef(
  model: IncomeExpenseRefModel
): IncomeExpenseRef {
  return {
    transactionId: serializeId(model.transactionId),
    date: serializeDate(model.date),
    transactionNote: model.transactionNote,
    bookingNote: model.bookingNote,
    currency: model.currency,
    amount: serializeDecimal(model.amount),
    amountInReferenceCurrency: serializeDecimal(
      model.amountInReferenceCurrency
    ),
  };
}

function serializeValueProfitOrLossSection(
  model: ValueProfitOrLossSectionModel
): ValueProfitOrLossSection {
  return {
    currencies: transformRecord(model.currencies, serializeDecimal),
    stocks: transformRecord(model.stocks, serializeDecimal),
    valuatedAccounts: transformRecord(model.valuatedAccounts, serializeDecimal),
    accountCategories: transformRecord(
      model.accountCategories,
      serializeDecimal
    ),
    accounts: transformRecord(model.accounts, serializeDecimal),
    valueTypes: transformRecord(model.valueTypes, serializeDecimal),
    valueSubtypes: transformRecord(model.valueSubtypes, serializeDecimal),
    total: serializeDecimal(model.total),
  };
}

function serializeTransferProfitOrLossSection(
  model: TransferProfitOrLossSectionModel
): TransferProfitOrLossSection {
  return {
    transfers: transformRecord(model.transfers, serializeDecimal),
    total: serializeDecimal(model.total),
  };
}

export function serializePeriod(model: PeriodModel): Period {
  return {
    _id: serializeDate(model._id),
    type: model.type,
    profits: model.profits.map(serializeProfitOrLossEntry),
    losses: model.losses.map(serializeProfitOrLossEntry),
    income: serializeIncomeExpensesSection(model.income),
    expenses: serializeIncomeExpensesSection(model.expenses),
    valueProfitOrLoss: serializeValueProfitOrLossSection(
      model.valueProfitOrLoss
    ),
    transferProfitOrLoss: serializeTransferProfitOrLossSection(
      model.transferProfitOrLoss
    ),
    profitOrLoss: serializeDecimal(model.profitOrLoss),
    cashFlow: serializeDecimal(model.cashFlow),
  };
}

function serializeProfitOrLossEntry<
  IncomeOrExpense extends "income" | "expense"
>(
  model: ProfitOrLossEntryModel<IncomeOrExpense>
): ProfitOrLossEntry<IncomeOrExpense> {
  return {
    type: model.type,
    categoryId: model.categoryId ? serializeId(model.categoryId) : undefined,
    amount: serializeDecimal(model.amount),
  };
}

export function deserializeMonthPeriod(monthPeriod: MonthPeriod): PeriodModel {
  return {
    _id: deserializeDate(monthPeriod._id),
    type: monthPeriod.type,
    cashFlow: deserializeDecimal(monthPeriod.cashFlow),
    profitOrLoss: deserializeDecimal(monthPeriod.profitOrLoss),
    income: deserializeIncomeExpensesSection(monthPeriod.income),
    expenses: deserializeIncomeExpensesSection(monthPeriod.expenses),
    transferProfitOrLoss: {
      transfers: transformRecord(
        monthPeriod.transferProfitOrLoss.transfers,
        (v) => deserializeDecimal(v)
      ),
      total: deserializeDecimal(monthPeriod.transferProfitOrLoss.total),
    },
    valueProfitOrLoss: {
      accountCategories: transformRecord(
        monthPeriod.valueProfitOrLoss.accountCategories,
        (v) => deserializeDecimal(v)
      ),
      currencies: transformRecord(
        monthPeriod.valueProfitOrLoss.accountCategories,
        (v) => deserializeDecimal(v)
      ),
      stocks: transformRecord(
        monthPeriod.valueProfitOrLoss.accountCategories,
        (v) => deserializeDecimal(v)
      ),
      valuatedAccounts: transformRecord(
        monthPeriod.valueProfitOrLoss.accountCategories,
        (v) => deserializeDecimal(v)
      ),
      accounts: transformRecord(monthPeriod.valueProfitOrLoss.accounts, (v) =>
        deserializeDecimal(v)
      ),
      valueTypes: transformRecord(
        monthPeriod.valueProfitOrLoss.valueTypes,
        (v) => deserializeDecimal(v)
      ),
      valueSubtypes: transformRecord(
        monthPeriod.valueProfitOrLoss.valueSubtypes,
        (v) => deserializeDecimal(v)
      ),
      total: deserializeDecimal(monthPeriod.transferProfitOrLoss.total),
    },
    profits: monthPeriod.profits.map(deserializeProfitOrLossEntry),
    losses: monthPeriod.losses.map(deserializeProfitOrLossEntry),
  };
}

function deserializeProfitOrLossEntry<
  TIncomeOrExpense extends "income" | "expense"
>(
  profitOrLossEntry: ProfitOrLossEntry<TIncomeOrExpense>
): ProfitOrLossEntryModel<TIncomeOrExpense> {
  return {
    amount: deserializeDecimal(profitOrLossEntry.amount),
    type: profitOrLossEntry.type,
    categoryId: profitOrLossEntry.categoryId
      ? deserializeId(profitOrLossEntry.categoryId)
      : undefined,
  };
}

function deserializeIncomeExpensesSection(
  incomeExpensesSection: IncomeExpensesSection
): IncomeExpensesSectionModel {
  return {
    categories: transformRecord(incomeExpensesSection.categories, (s) => ({
      bookings: s.bookings.map<IncomeExpenseRefModel>((b) => ({
        transactionId: deserializeId(b.transactionId),
        date: deserializeDate(b.date),
        amount: deserializeDecimal(b.amount),
        amountInReferenceCurrency: deserializeDecimal(
          b.amountInReferenceCurrency
        ),
        currency: b.currency,
        bookingNote: b.bookingNote,
        transactionNote: b.transactionNote,
      })),
      total: deserializeDecimal(s.total),
    })),
    total: deserializeDecimal(incomeExpensesSection.total),
  };
}
