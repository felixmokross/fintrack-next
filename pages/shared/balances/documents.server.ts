import { Decimal128 } from "mongodb";

export interface MonthBalances {
  _id: Date;
  accountCategories: {
    [accountCategoryId: string]: Decimal128;
  };
  netWorth: Decimal128;
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
