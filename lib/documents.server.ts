import { Decimal128, ObjectId } from "mongodb";
import {
  AccountCategoryType,
  AccountType,
  AccountUnitKind,
  BookingType,
  PeriodType,
} from "./enums";

export interface AccountCategory {
  _id?: ObjectId;
  name: string;
  type: AccountCategoryType;
  order: number;
  currentBalance: Decimal128;
}

export interface Account {
  _id?: ObjectId;
  name: string;
  type: AccountType;
  unit: AccountUnit;
  valueTypeId?: ObjectId;
  valueSubtypeId?: ObjectId;
  categoryId: ObjectId;
  categoryType: AccountCategoryType;
  groupId?: ObjectId;
  openingBalance?: Decimal128 | null;
  openingDate?: Date | null;
  closingDate?: Date | null;
  isActive: boolean;
  currentBalance: {
    valueInAccountUnit: Decimal128;
    valueInReferenceCurrency: Decimal128;
  };
}

export type AccountUnit = CurrencyAccountUnit | StockAccountUnit;

export interface CurrencyAccountUnit {
  kind: AccountUnitKind.CURRENCY;
  currency: string;
}

export interface StockAccountUnit {
  kind: AccountUnitKind.STOCK;
  stockId: ObjectId;
}

export interface MonthBalances {
  _id: Date;
  accountCategories: {
    [accountCategoryId: string]: Decimal128;
  };
  netWorth: Decimal128;
}

export interface Transaction {
  _id?: ObjectId;
  date: Date;
  note?: string;
  bookings: readonly Booking[];
}

export type Booking =
  | Charge
  | Deposit
  | Income
  | Expense
  | Appreciation
  | Depreciation;

interface CommonBooking {
  type: BookingType;
}

export interface Charge extends CommonBooking {
  type: BookingType.CHARGE;
  note?: string;
  accountId: ObjectId;
  unit: AccountUnit; // TODO is the unit required on the booking? on client side we now cope without it
  amount: Decimal128;
}

export interface Deposit extends CommonBooking {
  type: BookingType.DEPOSIT;
  note?: string;
  accountId: ObjectId;
  unit: AccountUnit; // TODO is the unit required on the booking? on client side we now cope without it
  amount: Decimal128;
}

export interface Income extends CommonBooking {
  type: BookingType.INCOME;
  note?: string;
  incomeCategoryId: ObjectId;
  currency: string;
  amount: Decimal128;
}

export interface Expense extends CommonBooking {
  type: BookingType.EXPENSE;
  note?: string;
  expenseCategoryId: ObjectId;
  currency: string;
  amount: Decimal128;
}

export interface Appreciation extends CommonBooking {
  type: BookingType.APPRECIATION;
  amount: Decimal128;
}

export interface Depreciation extends CommonBooking {
  type: BookingType.DEPRECIATION;
  amount: Decimal128;
}

export interface ForexRate {
  _id: {
    currency: string;
    date: Date;
  };
  value: Decimal128;
}

export interface StockPrice {
  _id: {
    stockId: ObjectId;
    date: Date;
  };
  currency: string;
  value: Decimal128;
  tradingDate: Date;
}

export interface DayLedger {
  _id: DayLedgerId;
  lines: readonly DayLedgerLine[];
  change: Decimal128;
  balance: Decimal128;
}

export interface DayLedgerId {
  accountId: ObjectId;
  date: Date;
}

export interface DayLedgerLine {
  transactionId: ObjectId;
  note?: string;
  bookings: readonly Booking[];
  value: Decimal128;
}

export interface DayBalances {
  _id: Date;
  byAccount: {
    [accountId: string]: {
      balanceInAccountCurrency: Decimal128;
      balanceInReferenceCurrency: Decimal128;
    };
  };
}

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
