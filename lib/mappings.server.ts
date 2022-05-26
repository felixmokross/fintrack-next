import { Account, AccountCategory, AccountUnit } from "./documents.server";
import {
  AccountCategoryDto,
  AccountDetailDto,
  AccountDto,
  AccountUnitDto,
} from "./dtos";
import { AccountUnitKind } from "./enums";
import { ensure } from "./util";

export function toAccountCategoryDto(
  accountCategory: AccountCategory
): AccountCategoryDto {
  return {
    ...accountCategory,
    _id: ensure(accountCategory._id).toHexString(),
    currentBalance: accountCategory.currentBalance.toString(),
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

export function toAccountDetailDto(account: Account): AccountDetailDto {
  return {
    _id: ensure(account._id).toHexString(),
    name: account.name,
    type: account.type,
    unit: toAccountUnitDto(account.unit),
    categoryId: account.categoryId.toHexString(),
    categoryType: account.categoryType,
    groupId: account.groupId?.toHexString() || null,
    isActive: account.isActive,
    openingBalance: account.openingBalance?.toString() || null,
    openingDate: account.openingDate?.toUTCString() || null,
    closingDate: account.closingDate?.toUTCString() || null,
  };
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
