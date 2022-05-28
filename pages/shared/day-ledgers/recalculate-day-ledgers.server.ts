import { Dayjs } from "dayjs";
import { Db, Filter } from "mongodb";
import { DayLedger, serializeDayLedger } from "./documents.server";
import { DayBalancesModel } from "../balances/model.server";
import { DayLedgerLineModel, DayLedgerModel } from "./model.server";
import {
  ChargeModel,
  DepositModel,
  TransactionModel,
} from "../transactions/model.server";
import { serializeDate, serializeId } from "../serialization.server";
import { getTransactionsByAccountId } from "../transactions-by-account.server";
import Decimal from "decimal.js-light";
import { groupBy, last, sortBy } from "lodash";
import { isChargeOrDeposit } from "../transactions/functions";
import { BookingType } from "../transactions/enums";
import { sum } from "../util";
import { AccountModel } from "../../accounts/shared/model.server";

export default async function recalculateDayLedgers(
  db: Db,
  newTransactions: readonly TransactionModel[],
  baseDayBalances: DayBalancesModel,
  accountsById: Record<string, AccountModel>,
  accountIds?: readonly string[],
  startDate?: Dayjs
): Promise<void> {
  const newTransactionsByAccountId =
    getTransactionsByAccountId(newTransactions);

  const accounts = accountIds
    ? accountIds.map((id) => accountsById[id])
    : Object.values(accountsById);

  let dayLedgers: readonly DayLedgerModel[] = [];
  for (const account of accounts) {
    dayLedgers = dayLedgers.concat(
      calculateNewDayLedgers(
        account,
        newTransactionsByAccountId[account._id] || [],
        baseDayBalances.byAccount[account._id]?.balanceInAccountCurrency
      )
    );
  }

  console.log(`${dayLedgers.length} day ledgers to be created`);

  await deleteDayLedgers(accountIds, startDate);
  await storeDayLedgers(dayLedgers);

  async function deleteDayLedgers(
    accountIds?: readonly string[],
    startDate?: Dayjs
  ) {
    const conditions: Filter<DayLedger>[] = [
      ...(accountIds
        ? [{ "_id.accountId": { $in: accountIds.map(serializeId) } }]
        : []),
      ...(startDate
        ? [{ "_id.date": { $gte: serializeDate(startDate) } }]
        : []),
    ];
    return await db
      .collection<DayLedger>("dayLedgers")
      .deleteMany(conditions.length > 0 ? { $and: conditions } : {});
  }

  async function storeDayLedgers(dayLedgers: readonly DayLedgerModel[]) {
    if (dayLedgers.length === 0) return;

    return await db
      .collection<DayLedger>("dayLedgers")
      .insertMany(dayLedgers.map(serializeDayLedger));
  }
}

function calculateNewDayLedgers(
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
