import Decimal from "decimal.js-light";
import { useState } from "react";
import { AccountUnitDto } from "../accounts/shared/dtos";
import { AccountUnitKind } from "../accounts/shared/enums";
import { locale } from "./util";

export default function ValueDisplay(props: ValueDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <span onClick={() => setIsExpanded(!isExpanded)}>
      <Label {...props} isExpanded={isExpanded} />
    </span>
  );
}

function Label({
  value,
  unit,
  showInverted = false,
  showSignAlways = false,
  isExpanded,
}: ValueDisplayProps & { isExpanded: boolean }) {
  if (unit.kind !== AccountUnitKind.CURRENCY)
    return <>{renderValue(value, showInverted, showSignAlways, isExpanded)}</>;

  return (
    <>
      {renderValue(
        value,
        showInverted,
        showSignAlways,
        isExpanded,
        2 // TODO get decimals from currencies
        // item.decimals !== undefined ? item.decimals : 2
      )}
    </>
  );
}

function renderValue(
  value: string | number,
  showInverted: boolean,
  showSignAlways: boolean,
  isExpanded: boolean,
  decimals = 0
): string {
  if (typeof value === "string") {
    value = parseFloat(value);
  }

  if (showInverted) {
    value = new Decimal(value).negated().toNumber();
  }

  const format = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: isExpanded ? 20 : decimals,
  });

  const formattedValue = format.format(value);
  return showSignAlways && value > 0 ? `+${formattedValue}` : formattedValue;
}

export interface ValueDisplayProps {
  value: string | number;
  unit: AccountUnitDto;
  showInverted?: boolean;
  showSignAlways?: boolean;
}
