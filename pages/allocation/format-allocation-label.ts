import Decimal from "decimal.js-light";
import { formatUnitValue, locale, RoundingMode } from "../shared/util";

const percentageFormat = new Intl.NumberFormat(locale, { style: "percent" });

export function formatAllocationLabel(
  label: string,
  value: number,
  total: Decimal
): string {
  const percentage = new Decimal(value).dividedBy(total).toNumber();
  return `${label}: ${formatUnitValue(
    value,
    RoundingMode.ROUND_TO_THOUSANDS
  )} (${percentageFormat.format(percentage)})`;
}
