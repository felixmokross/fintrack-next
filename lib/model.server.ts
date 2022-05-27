import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { AccountCategoryType, BookingType, PeriodType } from "./enums";
import { AccountType, AccountUnitKind } from "../pages/shared/accounts/enums";

export interface AccountModel {
  _id: string;
  name: string;
  type: AccountType;
  unit: AccountUnitModel;
  categoryId: string;
  categoryType: AccountCategoryType;
  valueTypeId?: string;
  valueSubtypeId?: string;
  groupId?: string;
  openingBalance?: Decimal;
  openingDate?: Dayjs;
  closingDate?: Dayjs;
  isActive: boolean;
  currentBalance: {
    valueInAccountUnit: Decimal;
    valueInReferenceCurrency: Decimal;
  };
}

export type AccountUnitModel = CurrencyAccountUnitModel | StockAccountUnitModel;

export interface CurrencyAccountUnitModel {
  kind: AccountUnitKind.CURRENCY;
  currency: string;
}

export interface StockAccountUnitModel {
  kind: AccountUnitKind.STOCK;
  stockId: string;
}

export interface TransactionModel {
  _id: string;
  date: Dayjs;
  note?: string;
  bookings: readonly BookingModel[];
}

export type BookingModel =
  | ChargeModel
  | DepositModel
  | IncomeModel
  | ExpenseModel
  | AppreciationModel
  | DepreciationModel;

interface CommonBookingModel {
  type: BookingType;
}

export interface ChargeModel extends CommonBookingModel {
  type: BookingType.CHARGE;
  note?: string;
  accountId: string;
  unit: AccountUnitModel;
  amount: Decimal;
}

export interface DepositModel extends CommonBookingModel {
  type: BookingType.DEPOSIT;
  note?: string;
  accountId: string;
  unit: AccountUnitModel;
  amount: Decimal;
}

export interface IncomeModel extends CommonBookingModel {
  type: BookingType.INCOME;
  note?: string;
  incomeCategoryId: string;
  currency: string;
  amount: Decimal;
}

export interface ExpenseModel extends CommonBookingModel {
  type: BookingType.EXPENSE;
  note?: string;
  expenseCategoryId: string;
  currency: string;
  amount: Decimal;
}

export interface AppreciationModel extends CommonBookingModel {
  type: BookingType.APPRECIATION;
  amount: Decimal;
}

export interface DepreciationModel extends CommonBookingModel {
  type: BookingType.DEPRECIATION;
  amount: Decimal;
}

export interface DayLedgerModel {
  _id: DayLedgerIdModel;
  lines: readonly DayLedgerLineModel[];
  change: Decimal;
  balance: Decimal;
}

export interface DayLedgerIdModel {
  accountId: string;
  date: Dayjs;
}

export interface DayLedgerLineModel {
  transactionId: string;
  note?: string;
  bookings: readonly BookingModel[];
  value: Decimal;
}

export interface DayBalancesModel {
  _id: Dayjs;
  byAccount: {
    [accountId: string]: AccountBalanceModel;
  };
}

export interface AccountBalanceModel {
  balanceInAccountCurrency: Decimal;
  balanceInReferenceCurrency: Decimal;
}

export interface MonthBalancesModel {
  _id: Dayjs;
  accountCategories: {
    [accountCategoryId: string]: Decimal;
  };
  netWorth: Decimal;
}

export interface PeriodModel {
  _id: Dayjs;
  type: PeriodType.MONTH | PeriodType.QUARTER | PeriodType.YEAR;
  profits: readonly ProfitOrLossEntryModel<"income">[];
  losses: readonly ProfitOrLossEntryModel<"expense">[];
  income: IncomeExpensesSectionModel;
  expenses: IncomeExpensesSectionModel;
  transferProfitOrLoss: TransferProfitOrLossSectionModel;
  valueProfitOrLoss: ValueProfitOrLossSectionModel;
  profitOrLoss: Decimal;
  cashFlow: Decimal;
}

export interface ProfitOrLossEntryModel<
  IncomeOrExpense extends "income" | "expense" = "income" | "expense"
> {
  type: IncomeOrExpense | "value" | "transfers";
  categoryId?: string;
  amount: Decimal;
}

export interface IncomeExpensesSectionModel {
  categories: {
    [categoryId: string]: IncomeExpensesCategoryEntryModel;
  };
  total: Decimal;
}

export interface IncomeExpensesCategoryEntryModel {
  bookings: readonly IncomeExpenseRefModel[];
  total: Decimal;
}

export interface IncomeExpenseRefModel {
  transactionId: string;
  date: Dayjs;
  transactionNote?: string;
  bookingNote?: string;
  currency: string;
  amount: Decimal;
  amountInReferenceCurrency: Decimal;
}

export interface ValueProfitOrLossSectionModel {
  stocks: { [stockId: string]: Decimal };
  currencies: { [currency: string]: Decimal };
  valuatedAccounts: { [accountId: string]: Decimal };
  accountCategories: { [accountCategoryId: string]: Decimal };
  accounts: { [accountId: string]: Decimal };
  valueTypes: { [valueTypeId: string]: Decimal };
  valueSubtypes: { [valueSubtypeId: string]: Decimal };
  total: Decimal;
}

export interface TransferProfitOrLossSectionModel {
  transfers: {
    [transactionId: string]: Decimal;
  };
  total: Decimal;
}

export function isCurrencyUnit<T extends AccountUnitLike>(
  unit: T
): unit is CurrencyAccountUnitLike<T> {
  return unit.kind === AccountUnitKind.CURRENCY;
}

export function isStockUnit<T extends AccountUnitLike>(
  unit: T
): unit is StockAccountUnitLike<T> {
  return unit.kind === AccountUnitKind.STOCK;
}

export function isCurrencyAccountModel(
  account: AccountModel
): account is CurrencyAccountModel {
  return isCurrencyUnit(account.unit);
}

export function isStockAccountModel(
  account: AccountModel
): account is StockAccountModel {
  return isStockUnit(account.unit);
}

export type AccountUnitLike = { kind: AccountUnitKind };
export type CurrencyAccountUnitLike<T> = T & { kind: AccountUnitKind.CURRENCY };
export type StockAccountUnitLike<T> = T & { kind: AccountUnitKind.STOCK };
export type CurrencyAccountModel = AccountModel & {
  unit: CurrencyAccountUnitLike<AccountUnitModel>;
};
export type StockAccountModel = TrackedAccountModel & {
  unit: StockAccountUnitLike<AccountUnitModel>;
};

export type ValuatedAccountModel = AccountModel & {
  type: AccountType.VALUATED;
};
export type TrackedAccountModel = AccountModel & { type: AccountType.TRACKED };
