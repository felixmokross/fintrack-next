import { Decimal128, ObjectId } from "mongodb";
import {
  deserializeDate,
  deserializeDecimal,
  deserializeId,
  serializeId,
} from "../../shared/serialization.server";
import { AccountCategoryType } from "../../shared/account-categories/enums";
import { ensure } from "../../shared/util";
import { AccountDto, AccountUnitDto } from "./dtos";
import { AccountType, AccountUnitKind } from "./enums";
import {
  AccountModel,
  AccountUnitModel,
  StockAccountUnitModel,
} from "./model.server";

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

export function serializeAccountUnit(unit: AccountUnitModel): AccountUnit {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return unit;
    case AccountUnitKind.STOCK:
      return serializeStockAccountUnit(unit);
  }
}

function serializeStockAccountUnit(
  unit: StockAccountUnitModel
): StockAccountUnit {
  return {
    ...unit,
    stockId: serializeId(unit.stockId),
  };
}

export function deserializeAccountUnit(unit: AccountUnit): AccountUnitModel {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return unit;
    case AccountUnitKind.STOCK:
      return deserializeStockAccountUnit(unit);
  }
}

function deserializeStockAccountUnit(
  unit: StockAccountUnit
): StockAccountUnitModel {
  return {
    ...unit,
    stockId: deserializeId(unit.stockId),
  };
}

export function deserializeAccount(a: Account): AccountModel {
  return {
    ...a,
    _id: deserializeId(ensure(a._id)),
    categoryId: deserializeId(a.categoryId),
    closingDate: a.closingDate ? deserializeDate(a.closingDate) : undefined,
    currentBalance: {
      valueInReferenceCurrency: deserializeDecimal(
        a.currentBalance.valueInReferenceCurrency
      ),
      valueInAccountUnit: deserializeDecimal(
        a.currentBalance.valueInAccountUnit
      ),
    },
    valueTypeId: a.valueTypeId ? deserializeId(a.valueTypeId) : undefined,
    valueSubtypeId: a.valueSubtypeId
      ? deserializeId(a.valueSubtypeId)
      : undefined,
    groupId: a.groupId ? deserializeId(a.groupId) : undefined,
    openingBalance: a.openingBalance
      ? deserializeDecimal(a.openingBalance)
      : undefined,
    openingDate: a.openingDate ? deserializeDate(a.openingDate) : undefined,
    unit: deserializeAccountUnit(a.unit),
  };
}

export function toAccountDto(account: Account): AccountDto {
  return {
    _id: ensure(account._id).toHexString(),
    name: account.name,
    type: account.type,
    unit: toAccountUnitDto(account.unit),
    valueTypeId: account.valueTypeId?.toHexString() || null,
    valueSubtypeId: account.valueSubtypeId?.toHexString() || null,
    categoryId: account.categoryId.toHexString(),
    categoryType: account.categoryType,
    groupId: account.groupId?.toHexString() || null,
    isActive: account.isActive,
    currentBalance: {
      valueInReferenceCurrency:
        account.currentBalance.valueInReferenceCurrency.toString(),
      valueInAccountUnit: account.currentBalance.valueInAccountUnit.toString(),
    },
    closingDate: account.closingDate?.toUTCString() || null,
  };
}
