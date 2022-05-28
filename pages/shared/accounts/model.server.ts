import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { AccountCategoryType } from "../account-categories/enums";
import { AccountType, AccountUnitKind } from "./enums";

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
