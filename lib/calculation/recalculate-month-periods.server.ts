import { Dayjs } from "dayjs";
import { groupBy } from "lodash";
import { Db } from "mongodb";
import {
  MonthPeriod,
  Period,
} from "../../pages/shared/periods/documents.server";
import {
  DayBalances,
  MonthBalances,
} from "../../pages/shared/balances/documents.server";
import { AccountCategory } from "../../pages/shared/account-categories/documents.server";
import { Account } from "../../pages/shared/accounts/documents.server";
import { PeriodModel } from "../../pages/shared/periods/model.server";
import {
  DayBalancesModel,
  MonthBalancesModel,
} from "../../pages/shared/balances/model.server";
import { TransactionModel } from "../../pages/shared/transactions/model.server";
import { AccountModel } from "../../pages/shared/accounts/model.server";
import {
  deserializeAccount,
  deserializeDayBalances,
  deserializeMonthBalances,
  serializeDate,
  serializePeriod,
} from "../serialization.server";
import { byKey } from "../../pages/shared/util";
import { calculateMonthPeriod } from "./calculate-month-period.server";
import { RateProvider } from "./forex-rates.server";
import { StockPriceProvider } from "./stock-prices.server";
import { Stopwatch } from "./stopwatch.server";
import { globalOpeningDate } from "../../pages/shared/global-opening-date.server";

export async function recalculateMonthPeriods(
  db: Db,
  rateProvider: RateProvider,
  stockPriceProvider: StockPriceProvider,
  stopwatch: Stopwatch,
  transactions: readonly TransactionModel[],
  endDate: Dayjs,
  startDate?: Dayjs
): Promise<void> {
  console.log("preparing");
  const startMonth = (startDate || globalOpeningDate()).startOf("month");
  const endMonth = endDate.startOf("month");

  const transactionsByMonth = groupBy(transactions, (t) =>
    t.date.startOf("month").valueOf()
  );
  const [accounts, cashCategoryId, monthBalances] = await Promise.all([
    readAccounts(),
    readCashCategoryId(),
    readMonthBalances(),
  ]);

  const monthBalancesByMonth = byKey(monthBalances, (mb) => mb._id.valueOf());

  stopwatch.logLeap();
  console.log("calculating month periods");

  const monthPeriods = new Array<PeriodModel>(
    endMonth.diff(startMonth, "month") + 1
  );
  for (
    let i = 0, currentMonth = startMonth;
    i < monthPeriods.length;
    i++, currentMonth = currentMonth.add(1, "month")
  ) {
    console.log(currentMonth.format("YYYY-MM"));

    // TODO could be improved by loading all at once from DB
    const periodStartBalances = await readDayBalances(
      currentMonth.subtract(1, "day")
    );
    const periodEndBalances = await readDayBalances(
      i === monthPeriods.length - 1
        ? endDate
        : currentMonth.endOf("month").startOf("day")
    );

    monthPeriods[i] = calculateMonthPeriod(
      currentMonth,
      transactionsByMonth[currentMonth.valueOf()] || [],
      accounts,
      periodStartBalances,
      periodEndBalances,
      rateProvider,
      stockPriceProvider,
      cashCategoryId,
      monthBalancesByMonth
    );
  }

  stopwatch.logLeap();
  console.log("writing data");
  await deleteMonthPeriods();
  await storeMonthPeriods(monthPeriods);

  stopwatch.logLeap();

  // TODO load accounts only once
  async function readAccounts(): Promise<readonly AccountModel[]> {
    return (
      await db
        .collection<Account>("accounts")
        .find({
          $and: [
            {
              $or: [
                { openingDate: null },
                { openingDate: { $lte: serializeDate(endDate) } },
              ],
            },
            {
              $or: [
                { closingDate: null },
                { closingDate: { $gte: serializeDate(startMonth) } },
              ],
            },
          ],
        })
        .toArray()
    ).map(deserializeAccount);
  }

  async function readDayBalances(date: Dayjs): Promise<DayBalancesModel> {
    const dayBalances = await db
      .collection<DayBalances>("dayBalances")
      .findOne({ _id: serializeDate(date) });
    if (!dayBalances) throw new Error("No day balances!");
    return deserializeDayBalances(dayBalances);
  }

  async function readCashCategoryId(): Promise<string> {
    const [cashCategoryId] = (
      await db
        .collection<AccountCategory>("accountCategories")
        .find()
        .sort({ order: 1 })
        .limit(1)
        .toArray()
    ).map((ac) => ac._id.toHexString());

    return cashCategoryId;
  }

  async function readMonthBalances(): Promise<readonly MonthBalancesModel[]> {
    return (
      await db
        .collection<MonthBalances>("monthBalances")
        .find({
          $and: [
            { _id: { $gte: serializeDate(startMonth.subtract(1, "month")) } },
            { _id: { $lte: serializeDate(endMonth) } },
          ],
        })
        .toArray()
    ).map(deserializeMonthBalances);
  }

  async function deleteMonthPeriods(): Promise<void> {
    await db
      .collection<MonthPeriod>("monthPeriods")
      .deleteMany({ _id: { $gte: serializeDate(startMonth) } });
  }

  async function storeMonthPeriods(
    monthPeriods: readonly PeriodModel[]
  ): Promise<void> {
    await db
      .collection<Period>("monthPeriods")
      .insertMany(monthPeriods.map(serializePeriod));
  }
}
