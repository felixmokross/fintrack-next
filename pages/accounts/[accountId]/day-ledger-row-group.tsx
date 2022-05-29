import dayjs from "dayjs";
import { ReactElement } from "react";
import { AccountCategoryType } from "../../shared/account-categories/enums";
import { DayLedgerDto } from "../../shared/day-ledgers/dtos";
import { dateFormat } from "../../shared/util";
import ValueDisplay from "../../shared/value-display";
import { AccountUnitDto } from "../shared/dtos";
import { DayLedgerLineRow } from "./day-ledger-row";

export default function DayLedgerRowGroup({
  dayLedger,
  accountUnit,
  accountCategoryType,
}: DayLedgerRowGroupProps): ReactElement {
  return (
    <tbody role="rowgroup">
      <tr className="bg-gray-100 dark:bg-gray-800">
        <th className="py-2 pl-8 text-left font-medium" title="Date">
          {dayjs.utc(dayLedger._id.date).format(dateFormat)}
        </th>
        <th
          className="py-2 text-right font-normal text-gray-500 dark:text-gray-400"
          title="Balance"
        >
          <ValueDisplay
            value={dayLedger.balance}
            unit={accountUnit}
            showInverted={accountCategoryType === AccountCategoryType.LIABILITY}
          />
        </th>
        <th className="w-8" />
      </tr>
      {dayLedger.lines.map((l, i, { length }) => (
        <DayLedgerLineRow
          key={l.transactionId}
          accountId={dayLedger._id.accountId}
          ledgerLine={l}
          isLast={i === length - 1}
          accountCategoryType={accountCategoryType}
          accountUnit={accountUnit}
        />
      ))}
    </tbody>
  );
}

export interface DayLedgerRowGroupProps {
  dayLedger: DayLedgerDto;
  accountCategoryType: AccountCategoryType;
  accountUnit: AccountUnitDto;
}
