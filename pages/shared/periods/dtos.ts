import { PeriodType } from "./enums";

export interface PeriodDto {
  _id: string;
  type: PeriodType;
  profits: readonly ProfitOrLossEntryDto<"income">[];
  losses: readonly ProfitOrLossEntryDto<"expense">[];
  income: SectionWithCategoriesDto;
  expenses: SectionWithCategoriesDto;
  valueProfitOrLoss: ValueProfitOrLossSectionDto;
  transferProfitOrLoss: TransferProfitOrLossSectionDto;
  profitOrLoss: string;
  cashFlow: string;
}
export interface TransferProfitOrLossSectionDto {
  transfers: {
    [transactionId: string]: string;
  };
  total: string;
}

export interface ProfitOrLossEntryDto<
  IncomeOrExpense extends "income" | "expense" = "income" | "expense"
> {
  type: IncomeOrExpense | "value" | "transfers";
  categoryId: string | null;
  amount: string;
}

export interface ValueProfitOrLossSectionDto {
  stocks: { [stockId: string]: string };
  currencies: { [currency: string]: string };
  valuatedAccounts: { [accountId: string]: string };
  accountCategories: { [accountCategoryId: string]: string };
  accounts: { [accountId: string]: string };
  valueTypes: { [valueTypeId: string]: string };
  valueSubtypes: { [valueSubtypeId: string]: string };
  total: string;
}

export interface SectionWithCategoriesDto {
  categories: {
    [categoryId: string]: {
      bookings: readonly IncomeExpenseRefDto[];
      total: string;
    };
  };
  total: string;
}

export interface IncomeExpenseRefDto {
  transactionId: string;
  date: string;
  transactionNote: string | null;
  bookingNote: string | null;
  currency: string;
  amount: string;
  amountInReferenceCurrency: string;
}
