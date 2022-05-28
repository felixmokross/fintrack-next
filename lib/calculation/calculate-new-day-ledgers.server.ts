import Decimal from "decimal.js-light";
import { groupBy, last, sortBy } from "lodash";
import { BookingType } from "../../pages/shared/transactions/enums";
import {
  DayLedgerLineModel,
  DayLedgerModel,
} from "../../pages/shared/day-ledgers/model.server";
import {
  ChargeModel,
  DepositModel,
  TransactionModel,
} from "../../pages/shared/transactions/model.server";
import { AccountModel } from "../../pages/shared/accounts/model.server";
import { sum } from "../../pages/shared/util";
import { isChargeOrDeposit } from "../../pages/shared/transactions/functions";

export default function calculateNewDayLedgers(
  account: AccountModel,
  newTransactions: readonly TransactionModel[],
  baseBalance?: Decimal
): DayLedgerModel[] {
  const transactionsByDate = groupBy(newTransactions, (t) => t.date.valueOf());
  return sortBy(Object.entries(transactionsByDate), ([d]) => d.valueOf())
    .map(([, ts]) => ts)
    .reduce(nextDayLedgers, []);

  function nextDayLedgers(
    prevDayLedgers: readonly DayLedgerModel[],
    transactions: readonly TransactionModel[]
  ): DayLedgerModel[] {
    const lines = transactions.map(toDayLedgerLine);
    const change = sum(lines.map((l) => l.value));

    return prevDayLedgers.concat({
      _id: { accountId: account._id, date: transactions[0].date },
      lines,
      change,
      balance: getLastBalance(prevDayLedgers).plus(change),
    });
  }

  function toDayLedgerLine(transaction: TransactionModel): DayLedgerLineModel {
    const booking = transaction.bookings
      .filter(isChargeOrDeposit)
      .find((b) => b.accountId === account._id);
    if (!booking) {
      throw new Error(
        `Transaction ${transaction._id} does not have charge/deposit booking for account ${account._id}!`
      );
    }
    return {
      transactionId: transaction._id,
      note: transaction.note,
      bookings: transaction.bookings,
      value: getValue(booking),
    };
  }

  function getLastBalance(dayLedgers: readonly DayLedgerModel[]): Decimal {
    return (last(dayLedgers) || { balance: baseBalance || new Decimal(0) })
      .balance;
  }
}

function getValue(booking: ChargeModel | DepositModel): Decimal {
  switch (booking.type) {
    case BookingType.CHARGE:
      return booking.amount.negated();
    case BookingType.DEPOSIT:
      return booking.amount;
  }
}
