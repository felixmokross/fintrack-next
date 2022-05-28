import { AccountCategory } from "../pages/shared/account-categories/documents.server";
import {
  Booking,
  Charge,
  Deposit,
  Expense,
  Income,
} from "../pages/shared/transactions/documents.server";
import { Account } from "../pages/shared/accounts/documents.server";
import {
  SaveTransactionBookingDto,
  SaveTransactionChargeDto,
  SaveTransactionDepositDto,
} from "../pages/shared/transactions/dtos";
import { AccountCategoryDto } from "../pages/shared/accounts/dtos";
import { BookingType } from "../pages/shared/transactions/enums";
import { serializeDecimal, serializeId } from "./serialization.server";
import { ensure } from "../pages/shared/util";

export function toAccountCategoryDto(
  accountCategory: AccountCategory
): AccountCategoryDto {
  return {
    ...accountCategory,
    _id: ensure(accountCategory._id).toHexString(),
    currentBalance: accountCategory.currentBalance.toString(),
  };
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
