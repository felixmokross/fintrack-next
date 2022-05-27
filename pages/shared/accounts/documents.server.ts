import { Decimal128, ObjectId } from "mongodb";
import { AccountCategoryType } from "../../../lib/enums";
import { AccountUnitDto } from "./dtos";
import { AccountType, AccountUnitKind } from "./enums";

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

export function toAccountUnitDto(unit: AccountUnit): AccountUnitDto {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return {
        kind: unit.kind,
        currency: unit.currency,
      };
    case AccountUnitKind.STOCK:
      return {
        kind: unit.kind,
        stockId: unit.stockId.toHexString(),
      };
  }
}
