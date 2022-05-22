import { AccountCategoryType, AccountType, AccountUnitKind } from "./enums";

export interface AccountDto {
  _id: string;
  name: string;
  type: AccountType;
  unit: AccountUnitDto;
  valueTypeId: string | null;
  valueSubtypeId: string | null;
  categoryId: string;
  categoryType: AccountCategoryType;
  groupId: string | null;
  isActive: boolean;
  currentBalance: {
    valueInAccountUnit: string;
    valueInReferenceCurrency: string;
  };
  closingDate: string | null;
}

export type AccountUnitDto = CurrencyAccountUnitDto | StockAccountUnitDto;

export interface CurrencyAccountUnitDto {
  kind: AccountUnitKind.CURRENCY;
  currency: string;
}

export interface StockAccountUnitDto {
  kind: AccountUnitKind.STOCK;
  stockId: string;
}

export interface AccountCategoryDto {
  _id: string;
  name: string;
  type: AccountCategoryType;
  order: number;
  currentBalance: string;
}
