import { BookingType } from "./enums";

export function isChargeOrDeposit<T extends BookingLike>(
  booking: T
): booking is ChargeOrDepositLike<T> {
  return (
    booking.type === BookingType.CHARGE || booking.type === BookingType.DEPOSIT
  );
}

export type ChargeLike<T> = T & { type: BookingType.CHARGE };
export type DepositLike<T> = T & { type: BookingType.DEPOSIT };
export type ChargeOrDepositLike<T> = ChargeLike<T> | DepositLike<T>;

export function isIncomeOrExpense<T extends BookingLike>(
  booking: T
): booking is IncomeOrExpenseLike<T> {
  return (
    booking.type === BookingType.INCOME || booking.type === BookingType.EXPENSE
  );
}

export function isIncome<T extends BookingLike>(
  booking: T
): booking is IncomeLike<T> {
  return booking.type === BookingType.INCOME;
}

export function isExpense<T extends BookingLike>(
  booking: T
): booking is ExpenseLike<T> {
  return booking.type === BookingType.EXPENSE;
}

export type IncomeLike<T> = T & { type: BookingType.INCOME };
export type ExpenseLike<T> = T & { type: BookingType.EXPENSE };
export type IncomeOrExpenseLike<T> = IncomeLike<T> | ExpenseLike<T>;

export function isAppreciationOrDepreciation<T extends BookingLike>(
  booking: T
): booking is AppreciationOrDepreciationLike<T> {
  return (
    booking.type === BookingType.APPRECIATION ||
    booking.type === BookingType.DEPRECIATION
  );
}

export type AppreciationLike<T> = T & { type: BookingType.APPRECIATION };
export type DepreciationLike<T> = T & { type: BookingType.DEPRECIATION };
export type AppreciationOrDepreciationLike<T> =
  | AppreciationLike<T>
  | DepreciationLike<T>;

export type BookingLike = { type: BookingType };
