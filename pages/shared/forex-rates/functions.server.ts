import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { groupBy, uniq } from "lodash";
import { Db } from "mongodb";
import { ForexRate } from "./documents.server";
import {
  baseCurrency,
  byKey,
  referenceCurrency,
  transformRecord,
} from "../util";

export function convertToCurrency(
  value: Decimal,
  sourceCurrency: string,
  targetCurrency: string,
  date: Dayjs,
  rateProvider: RateProvider
): Decimal {
  if (sourceCurrency === targetCurrency) {
    return value;
  }

  const baseToSourceRate = getRate(sourceCurrency);
  const baseToTargetRate = getRate(targetCurrency);

  return value.dividedBy(baseToSourceRate).mul(baseToTargetRate);

  function getRate(currency: string): Decimal {
    return currency === baseCurrency
      ? new Decimal(1)
      : rateProvider(currency, date);
  }
}

export type RateProvider = (currency: string, date: Dayjs) => Decimal;

export async function getDbRateProviderAsync(
  db: Db,
  startDate?: Dayjs
): Promise<RateProvider> {
  console.log("creating db rate provider");

  const currencies = await getAccountCurrenciesAsync(db, referenceCurrency);
  console.log(`currencies: ${currencies.join(", ")}`);

  const forexRateLookup = transformRecord(
    groupBy(
      await db
        .collection<ForexRate>("forexRates")
        .find({
          "_id.currency": { $in: currencies },
          ...(startDate ? { "_id.date": { $gte: startDate.toDate() } } : {}),
        })
        .toArray(),
      (fr) => fr._id.currency
    ),
    (forexRates) => byKey(forexRates, (fr) => fr._id.date.valueOf())
  );

  return (currency, date) => {
    const forexRatesByDate = forexRateLookup[currency];
    if (!forexRatesByDate)
      throw new Error(
        `No forex rate for ${currency} and ${date.format("YYYY-MM-DD")}`
      );
    const forexRate = forexRatesByDate[date.valueOf()];
    if (!forexRate)
      throw new Error(
        `No forex rate for ${currency} and ${date.format("YYYY-MM-DD")}`
      );

    return new Decimal(forexRate.value.toString());
  };
}

async function getAccountCurrenciesAsync(
  db: Db,
  referenceCurrency: string
): Promise<readonly string[]> {
  return uniq([
    referenceCurrency,
    ...(await getCurrencyAccountCurrenciesAsync(db)),
    ...(await getStockAccountCurrenciesAsync(db)),
  ]);
}

async function getCurrencyAccountCurrenciesAsync(
  db: Db
): Promise<readonly string[]> {
  return (
    await db
      .collection<{ _id: string }>("accounts")
      .aggregate([
        { $match: { "unit.kind": "CURRENCY" } },
        { $project: { currency: "$unit.currency", _id: 0 } },
        { $group: { _id: "$currency" } },
      ])
      .toArray()
  ).map(({ _id }) => _id);
}

async function getStockAccountCurrenciesAsync(
  db: Db
): Promise<readonly string[]> {
  return (
    await db
      .collection<{ _id: string }>("accounts")
      .aggregate([
        { $match: { "unit.kind": "STOCK" } },
        {
          $lookup: {
            from: "stockPrices",
            localField: "unit.stockId",
            foreignField: "_id.stockId",
            as: "unit.stockPrices",
          },
        },
        { $project: { currency: "$unit.stockPrices.currency", _id: 0 } },
        { $unwind: "$currency" },
        { $group: { _id: "$currency" } },
      ])
      .toArray()
  ).map(({ _id }) => _id);
}
