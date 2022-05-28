import { Decimal128 } from "mongodb";
import {
  deserializeDate,
  deserializeDecimal,
  serializeDate,
  serializeDecimal,
} from "../serialization.server";
import { transformRecord } from "../util";
import { DayBalancesModel, MonthBalancesModel } from "./model.server";

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

export function serializeDayBalances(
  dayBalances: DayBalancesModel
): DayBalances {
  return {
    _id: serializeDate(dayBalances._id),
    byAccount: transformRecord(dayBalances.byAccount, (balances) => ({
      balanceInAccountCurrency: serializeDecimal(
        balances.balanceInAccountCurrency
      ),
      balanceInReferenceCurrency: serializeDecimal(
        balances.balanceInReferenceCurrency
      ),
    })),
  };
}

export function serializeMonthBalances(
  monthBalances: MonthBalancesModel
): MonthBalances {
  return {
    ...monthBalances,
    _id: serializeDate(monthBalances._id),
    accountCategories: transformRecord(
      monthBalances.accountCategories,
      serializeDecimal
    ),
    netWorth: serializeDecimal(monthBalances.netWorth),
  };
}

export function deserializeMonthBalances(
  monthBalances: MonthBalances
): MonthBalancesModel {
  return {
    ...monthBalances,
    _id: deserializeDate(monthBalances._id),
    accountCategories: transformRecord(
      monthBalances.accountCategories,
      deserializeDecimal
    ),
    netWorth: deserializeDecimal(monthBalances.netWorth),
  };
}

export function deserializeDayBalances(
  dayBalances: DayBalances
): DayBalancesModel {
  return {
    _id: deserializeDate(dayBalances._id),
    byAccount: transformRecord(dayBalances.byAccount, (balances) => ({
      balanceInAccountCurrency: deserializeDecimal(
        balances.balanceInAccountCurrency
      ),
      balanceInReferenceCurrency: deserializeDecimal(
        balances.balanceInReferenceCurrency
      ),
    })),
  };
}
