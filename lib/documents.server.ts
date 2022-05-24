import { Decimal128, ObjectId } from "mongodb";
import { AccountCategoryType, AccountType, AccountUnitKind } from "./enums";

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
