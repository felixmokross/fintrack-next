import Link from "next/link";
import { ReactElement } from "react";
import { useRefData } from "../../ref-data-context";
import { AccountCategoryType } from "../../shared/account-categories/enums";
import { cn } from "../../shared/classnames";
import { DayLedgerLineDto } from "../../shared/day-ledgers/dtos";
import { TextSkeleton, TextSkeletonLength } from "../../shared/skeletons";
import {
  BookingDto,
  ChargeDto,
  DepositDto,
  ExpenseDto,
  IncomeDto,
} from "../../shared/transactions/dtos";
import { BookingType } from "../../shared/transactions/enums";
import { isChargeOrDeposit } from "../../shared/transactions/functions";
import ValueDisplay from "../../shared/value-display";
import { AccountUnitDto } from "../shared/dtos";

export function DayLedgerLineRow({
  ledgerLine,
  accountId,
  isLast = false,
  accountUnit,
  accountCategoryType,
}: DayLedgerLineRowProps): ReactElement {
  return (
    <tr className="group">
      <td className={cn("pl-8 pt-4", isLast && "pb-10")}>
        <ul title="Bookings">
          {ledgerLine.bookings
            .filter((b) => isCounterBooking(b, accountId))
            .map((b, i, { length }) => (
              <li key={i} className="inline">
                <BookingLabel booking={b} />
                {i === length - 1 ? "" : ", "}
              </li>
            ))}
        </ul>
        <div className="text-gray-500 dark:text-gray-400" title="Note">
          {ledgerLine.note}
        </div>
      </td>
      <td
        className={cn("pt-4 text-right align-top", isLast && "pb-10")}
        title="Charge/Deposit"
      >
        <ValueDisplay
          value={ledgerLine.value}
          unit={accountUnit}
          showInverted={accountCategoryType === AccountCategoryType.LIABILITY}
          showSignAlways={true}
        />
      </td>
      <td className={cn("w-8 pt-4", isLast && "pb-10")}>
        <div className="flex justify-center">
          {/* <ActionsMenu
                        transactionId={ledgerLine.transactionId}
                        accountId={accountId}
                        editMode={getEditMode(ledgerLine)}
                    /> */}
        </div>
      </td>
    </tr>
  );
}

export interface DayLedgerLineRowProps {
  ledgerLine: DayLedgerLineDto;
  accountId: string;
  isLast?: boolean;
  accountUnit: AccountUnitDto;
  accountCategoryType: AccountCategoryType;
}

function BookingLabel({ booking }: BookingLabelProps): ReactElement | null {
  switch (booking.type) {
    case BookingType.CHARGE:
    case BookingType.DEPOSIT:
      return <ChargeDepositBookingLabel booking={booking} />;
    case BookingType.INCOME:
      return <IncomeBookingLabel booking={booking} />;
    case BookingType.EXPENSE:
      return <ExpenseBookingLabel booking={booking} />;
    default:
      return null;
  }
}

interface BookingLabelProps {
  booking: BookingDto;
}

function ChargeDepositBookingLabel({
  booking,
}: {
  booking: ChargeDto | DepositDto;
}) {
  const { accounts } = useRefData();
  if (!accounts) return <TextSkeleton length={TextSkeletonLength.MEDIUM} />;
  return (
    <Link href={`../${booking.accountId}`}>
      <a className="text-blue-500 hover:underline dark:text-blue-400">
        {accounts[booking.accountId].name}
      </a>
    </Link>
  );
}

function IncomeBookingLabel({ booking }: { booking: IncomeDto }) {
  const { incomeCategories } = useRefData();
  if (!incomeCategories)
    return <TextSkeleton length={TextSkeletonLength.MEDIUM} />;
  return <>{incomeCategories[booking.incomeCategoryId].name}</>;
}

function ExpenseBookingLabel({ booking }: { booking: ExpenseDto }) {
  const { expenseCategories } = useRefData();
  if (!expenseCategories)
    return <TextSkeleton length={TextSkeletonLength.MEDIUM} />;
  return <>{expenseCategories[booking.expenseCategoryId].name}</>;
}

function isCounterBooking(booking: BookingDto, accountId: string): boolean {
  return !isChargeOrDeposit(booking) || booking.accountId !== accountId;
}

// function getEditMode(ledgerLine: DayLedgerLineDto): EditMode {
//     if (ledgerLine.bookings.some((b) => b.type === BookingType.APPRECIATION || b.type === BookingType.DEPRECIATION)) {
//         return EditMode.VALUE_CHANGE;
//     }

//     return EditMode.TRANSACTION;
// }
