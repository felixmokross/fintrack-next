import dayjs from "dayjs";
import Decimal, { Numeric } from "decimal.js-light";
import { ValueChangeFormValues } from "../pages/accounts/types";
import { SaveTransactionBookingDto, SaveTransactionDto } from "./dtos";
import { BookingType } from "./enums";

export const dateFormat = "DD MMM YYYY";

export function ensure<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Value is undefined");
  return value;
}

export function sum(values: readonly Numeric[]): Decimal {
  return values.reduce(
    (prev: Decimal, curr) => prev.plus(curr),
    new Decimal(0)
  );
}

export function byKey<T, K extends string | number>(
  collection: readonly T[],
  keyFunction: (i: T) => K
): Record<K, T> {
  return Object.fromEntries(
    collection.map((i) => [keyFunction(i), i]) as [string, T][]
  ) as Record<K, T>;
}

export const locale = "de-CH";

const numberFormat = new Intl.NumberFormat(locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const thousandsNumberFormat = new Intl.NumberFormat(locale, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatUnitValue(
  value: string | number,
  roundingMode: RoundingMode = RoundingMode.NORMAL,
  showInverted = false,
  showSignAlways = false
): string {
  if (typeof value === "string") {
    value = parseFloat(value);
  }

  if (showInverted) {
    value = new Decimal(value).negated().toNumber();
  }

  if (roundingMode === RoundingMode.ROUND_TO_THOUSANDS) {
    if (Math.abs(value) >= 9999.5)
      return `${thousandsNumberFormat.format(Math.round(value / 1000))}k`;

    return thousandsNumberFormat.format(value);
  }

  const formattedValue = numberFormat.format(value);
  return showSignAlways && value > 0 ? `+${formattedValue}` : formattedValue;
}

export enum RoundingMode {
  NORMAL = "NORMAL",
  ROUND_TO_THOUSANDS = "ROUND_TO_THOUSANDS",
}

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

// TODO store in config
export const referenceCurrency = "CHF";

export function transformRecord<T, U>(
  value: Record<string, T>,
  transformValue: (_: T) => U
): Record<string, U> {
  return Object.fromEntries(
    Object.entries(value).map(([propertyName, propertyValue]) => [
      propertyName,
      transformValue(propertyValue),
    ])
  );
}

export const baseCurrency = "USD";

export function transformValueChangeFormValuesToSaveTransactionDto(
  values: ValueChangeFormValues,
  accountId: string
): SaveTransactionDto {
  return {
    date: dayjs.utc(values.date, dateFormat).format("YYYY-MM-DD"),
    note: values.note || undefined,
    bookings: getBookings(),
  };

  function getBookings(): [
    SaveTransactionBookingDto,
    SaveTransactionBookingDto
  ] {
    const valueChangeDecimal = new Decimal(values.valueChange);
    if (valueChangeDecimal.isPositive()) {
      return [
        { type: BookingType.APPRECIATION, amount: values.valueChange },
        { type: BookingType.DEPOSIT, accountId, amount: values.valueChange },
      ];
    }

    const amount = valueChangeDecimal.negated().toString();
    return [
      { type: BookingType.DEPRECIATION, amount },
      { type: BookingType.CHARGE, accountId, amount },
    ];
  }
}
