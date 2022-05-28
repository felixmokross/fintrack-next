import dayjs, { Dayjs } from "dayjs";
import { Db } from "mongodb";
import { DayBalances, deserializeDayBalances } from "../documents.server";
import {
  Account,
  deserializeAccount,
} from "../../../accounts/shared/documents.server";
import { DayBalancesModel } from "../model.server";
import { TransactionModel } from "../../transactions/model.server";
import { serializeDate } from "../../serialization.server";
import { today } from "../../today";
import { byKey } from "../../util";
import { RateProvider } from "../../forex-rates/functions.server";
import { recalculateDayBalances } from "./recalculate-day-balances.server";
import recalculateDayLedgers from "../../day-ledgers/recalculate-day-ledgers.server";
import { recalculateMonthBalances } from "./recalculate-month-balances.server";
import { StockPriceProvider } from "../../stock-prices/functions.server";
import { Stopwatch } from "../../stopwatch.server";
import { globalOpeningDate } from "../../global-opening-date.server";
import { AccountModel } from "../../../accounts/shared/model.server";

export async function recalculateBalances(
  db: Db,
  rateProvider: RateProvider,
  stockPriceProvider: StockPriceProvider,
  stopwatch: Stopwatch,
  newTransactions: readonly TransactionModel[],
  accountIds?: readonly string[],
  startDate?: Dayjs
): Promise<void> {
  if (startDate && startDate.isSameOrBefore(globalOpeningDate())) {
    throw new Error("Start date must be after global opening date");
  }
  console.log("preparing");

  const yesterday = today().subtract(1, "day");

  // BUG this does not work if the startDate is in the future: we don't have future day balances
  // taking just the latest one is incorrect if there are already future transactions.
  // why do we not take the day ledgers as basis?
  const [baseDayBalances, allAccounts] = await Promise.all([
    readDayBalances((startDate || globalOpeningDate()).subtract(1, "day")),
    readAccounts(yesterday, startDate),
  ]);

  const allAccountsById = byKey(allAccounts, (a) => a._id);

  stopwatch.logLeap();
  console.log("recalculating day ledgers");

  await recalculateDayLedgers(
    db,
    newTransactions,
    baseDayBalances,
    allAccountsById,
    accountIds,
    startDate
  );

  stopwatch.logLeap();
  if (startDate && startDate.isSameOrAfter(today(), "day")) {
    return;
  }

  console.log("recalculating day balances");

  const dayBalances = await recalculateDayBalances(
    db,
    rateProvider,
    stockPriceProvider,
    stopwatch,
    baseDayBalances,
    yesterday,
    allAccounts,
    startDate
  );

  console.log("recalculating month balances");
  await recalculateMonthBalances(db, dayBalances, allAccounts, startDate);

  stopwatch.logLeap();

  async function readDayBalances(date: Dayjs): Promise<DayBalancesModel> {
    const [dayBalances] = await db
      .collection<DayBalances>("dayBalances")
      .find({ _id: { $lte: serializeDate(date) } })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();
    if (!dayBalances) throw new Error("No day balances!");
    return deserializeDayBalances(dayBalances);
  }

  async function readAccounts(
    endDate: Dayjs,
    startDate?: Dayjs
  ): Promise<readonly AccountModel[]> {
    return (
      await db
        .collection<Account>("accounts")
        .find({
          $and: [
            {
              $or: [
                { openingDate: null },
                {
                  openingDate: {
                    $lte: serializeDate(
                      dayjs.max([endDate, ...(startDate ? [startDate] : [])])
                    ),
                  },
                },
              ],
            },
            ...(startDate
              ? [
                  {
                    $or: [
                      { closingDate: null },
                      { closingDate: { $gte: serializeDate(startDate) } },
                    ],
                  },
                ]
              : []),
          ],
        })
        .toArray()
    ).map(deserializeAccount);
  }
}
