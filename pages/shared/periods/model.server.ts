import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { PeriodType } from "./enums";

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
