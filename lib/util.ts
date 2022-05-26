import Decimal, { Numeric } from "decimal.js-light";

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
