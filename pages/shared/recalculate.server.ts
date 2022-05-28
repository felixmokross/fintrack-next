import { Dayjs } from "dayjs";
import { groupBy } from "lodash";
import { Db, Decimal128, ObjectId } from "mongodb";
import { DayBalances } from "./balances/documents.server";
import { AccountCategory } from "./account-categories/documents.server";
import {
  deserializeTransaction,
  Transaction,
} from "./transactions/documents.server";
import { Account } from "./accounts/documents.server";
import { TransactionModel } from "./transactions/model.server";
import {
  deserializeId,
  serializeDate,
  serializeDecimal,
  serializeId,
} from "./serialization.server";
import { today } from "./today";
import { byKey, sum } from "./util";
import { recalculateBalances } from "./balances/calculation/recalculate-balances.server";
import { recalculateMonthPeriods } from "./periods/calculation/recalculate-month-periods.server";
import recalculateQuarterPeriods from "./periods/calculation/recalculate-quarter-periods.server";
import recalculateYearPeriods from "./periods/calculation/recalculate-year-periods.server";
import { Stopwatch } from "./stopwatch.server";
import { getDbRateProviderAsync } from "./forex-rates/functions.server";
import { getDbStockPriceProviderAsync } from "./stock-prices/functions.server";

export async function recalculate(
  db: Db,
  accountIds?: readonly ObjectId[],
  startDate?: Dayjs
): Promise<void> {
  console.log("refreshing");
  if (accountIds) console.log(`accountIds: ${accountIds.join(", ")}`);
  if (startDate) console.log(`startDate: ${startDate.format("YYYY-MM-DD")}`);

  const startOfMonth = startDate && startDate.startOf("month");

  const stopwatch = new Stopwatch();
  stopwatch.logStart();
  console.log("loading data");

  const [rateProvider, stockPriceProvider, transactions] = await Promise.all([
    getDbRateProviderAsync(db, startOfMonth),
    getDbStockPriceProviderAsync(db, startOfMonth),
    readTransactions(startOfMonth),
  ]);

  stopwatch.logLeap();

  console.log(`recalculating day ledgers, day balances, and month balances`);
  await recalculateBalances(
    db,
    rateProvider,
    stockPriceProvider,
    stopwatch,
    startDate
      ? transactions.filter((d) => d.date.isSameOrAfter(startDate))
      : transactions,
    accountIds && accountIds.map(deserializeId),
    startDate
  );

  console.log("updating accounts");

  const yesterday = today().subtract(1, "day");

  const [dayBalances, accounts] = await Promise.all([
    db
      .collection<DayBalances>("dayBalances")
      .findOne({ _id: serializeDate(yesterday) }),
    db.collection<Account>("accounts").find().toArray(),
  ]);

  if (!dayBalances)
    throw new Error(`no day balances for ${yesterday.toISOString()}`);
  const accountsById = byKey(accounts, (a) => a._id.toHexString());

  for (const accountId of accountIds ||
    Object.keys(dayBalances.byAccount).map(serializeId)) {
    const balanceInAccountCurrency =
      dayBalances.byAccount[accountId.toHexString()]
        ?.balanceInAccountCurrency || Decimal128.fromString("0");
    const balanceInReferenceCurrency =
      dayBalances.byAccount[accountId.toHexString()]
        ?.balanceInReferenceCurrency || Decimal128.fromString("0");
    await db.collection<Account>("accounts").updateOne(
      { _id: accountId },
      {
        $set: {
          "currentBalance.valueInAccountUnit": balanceInAccountCurrency,
          "currentBalance.valueInReferenceCurrency": balanceInReferenceCurrency,
        },
      }
    );
  }

  stopwatch.logLeap();
  console.log("updating account categories");
  const affectedAccountCategoryIds = (
    accountIds
      ? accountIds.map((id) => accountsById[id.toHexString()])
      : accounts
  ).map((a) => a.categoryId);

  const [affectedAccountCategories, accountsOfAffectedAccountCategories] =
    await Promise.all([
      db
        .collection<AccountCategory>("accountCategories")
        .find({ _id: { $in: affectedAccountCategoryIds } })
        .toArray(),
      db
        .collection<Account>("accounts")
        .find({ categoryId: { $in: affectedAccountCategoryIds } })
        .toArray(),
    ]);

  const accountsByCategoryId = groupBy(
    accountsOfAffectedAccountCategories,
    (a) => a.categoryId.toHexString()
  );

  for (const accountCategory of affectedAccountCategories) {
    await db.collection<AccountCategory>("accountCategories").updateOne(
      { _id: accountCategory._id },
      {
        $set: {
          currentBalance: serializeDecimal(
            sum(
              accountsByCategoryId[accountCategory._id.toHexString()].map((c) =>
                c.currentBalance.valueInReferenceCurrency.toString()
              )
            )
          ),
        },
      }
    );
  }

  stopwatch.logLeap();

  if (!startDate || startDate.isBefore(today(), "day")) {
    console.log("recalculating month periods");

    await recalculateMonthPeriods(
      db,
      rateProvider,
      stockPriceProvider,
      stopwatch,
      transactions.filter((t) => t.date.isSameOrBefore(yesterday)),
      yesterday,
      startDate
    );

    console.log("recalculating quarter periods");
    await recalculateQuarterPeriods(db, stopwatch, yesterday, startDate);

    console.log("recalculating year periods");

    await recalculateYearPeriods(db, stopwatch, yesterday, startDate);
  }

  stopwatch.logStop();
  console.log("done");

  async function readTransactions(
    startDate?: Dayjs
  ): Promise<readonly TransactionModel[]> {
    return (
      await (startDate
        ? db
            .collection<Transaction>("transactions")
            .find({ date: { $gte: serializeDate(startDate) } })
        : db.collection<Transaction>("transactions").find()
      ).toArray()
    ).map(deserializeTransaction);
  }
}
