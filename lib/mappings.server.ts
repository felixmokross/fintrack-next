import {
  Account,
  AccountCategory,
  AccountUnit,
  Booking,
  Charge,
  Deposit,
  Expense,
  Income,
} from "./documents.server";
import {
  AccountCategoryDto,
  AccountDetailDto,
  AccountDto,
  AccountUnitDto,
  SaveTransactionBookingDto,
  SaveTransactionChargeDto,
  SaveTransactionDepositDto,
} from "./dtos";
import { AccountUnitKind, BookingType } from "./enums";
import { serializeDecimal, serializeId } from "./serialization.server";
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

export function toBooking(
  dto: SaveTransactionBookingDto,
  accounts: readonly Account[]
): Booking {
  switch (dto.type) {
    case BookingType.CHARGE:
    case BookingType.DEPOSIT:
      return toChargeOrDeposit(dto, accounts);
    case BookingType.INCOME:
      return {
        type: BookingType.INCOME,
        note: dto.note,
        incomeCategoryId: serializeId(dto.incomeCategoryId),
        currency: dto.currency,
        amount: serializeDecimal(dto.amount),
      } as Income;
    case BookingType.EXPENSE:
      return {
        type: BookingType.EXPENSE,
        note: dto.note,
        expenseCategoryId: serializeId(dto.expenseCategoryId),
        currency: dto.currency,
        amount: serializeDecimal(dto.amount),
      } as Expense;
    case BookingType.APPRECIATION:
    case BookingType.DEPRECIATION:
      return {
        type: dto.type,
        amount: serializeDecimal(dto.amount),
      };
  }
}

function toChargeOrDeposit(
  dto: SaveTransactionChargeDto | SaveTransactionDepositDto,
  accounts: readonly Account[]
): Charge | Deposit {
  const accountId = serializeId(dto.accountId);
  const account = accounts.find((a) => ensure(a._id).equals(accountId));
  if (!account)
    throw new Error(`Account ${accountId.toHexString()} not found!`);

  return {
    type: dto.type,
    note: dto.note,
    accountId,
    unit: account.unit,
    amount: serializeDecimal(dto.amount),
  } as Charge | Deposit;
}
