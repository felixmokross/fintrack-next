import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";

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
