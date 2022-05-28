import { Decimal128, ObjectId } from "mongodb";
import { PeriodType } from "./enums";

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
