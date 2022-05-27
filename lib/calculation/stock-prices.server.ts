import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { groupBy } from "lodash";
import { Db } from "mongodb";
import { StockPrice } from "../documents.server";
import { byKey, transformRecord } from "../util";
import { convertToCurrency, RateProvider } from "./forex-rates.server";

export function convertStockQuantityToCurrency(
  quantity: Decimal,
  stockId: string,
  targetCurrency: string,
  date: Dayjs,
  stockPriceProvider: StockPriceProvider,
  rateProvider: RateProvider
): Decimal {
  const stockPrice = stockPriceProvider(stockId, date);
  const valueInStockCurrency = quantity.mul(stockPrice.value);

  return convertToCurrency(
    valueInStockCurrency,
    stockPrice.currency,
    targetCurrency,
    date,
    rateProvider
  );
}

export type StockPriceProvider = (
  stockId: string,
  date: Dayjs
) => StockPriceWithCurrency;

export interface StockPriceWithCurrency {
  value: Decimal;
  currency: string;
}

export async function getDbStockPriceProviderAsync(
  db: Db,
  startDate?: Dayjs
): Promise<StockPriceProvider> {
  console.log("creating stock price provider");

  const stockPriceLookup = transformRecord(
    groupBy(
      await (startDate
        ? db
            .collection<StockPrice>("stockPrices")
            .find({ "_id.date": { $gte: startDate.toDate() } })
        : db.collection<StockPrice>("stockPrices").find()
      ).toArray(),
      (sp) => sp._id.stockId.toHexString()
    ),
    (stockPrices) => byKey(stockPrices, (sp) => sp._id.date.valueOf())
  );

  return (stockId, date) => {
    const stockPricesByDate = stockPriceLookup[stockId];
    if (!stockPricesByDate)
      throw new Error(
        `No stock price for stock ${stockId} and ${date.format("YYYY-MM-DD")}`
      );
    const stockPrice = stockPricesByDate[date.valueOf()];

    if (!stockPrice)
      throw new Error(
        `No stock price for stock ${stockId} and ${date.format("YYYY-MM-DD")}`
      );

    return {
      currency: stockPrice.currency,
      value: new Decimal(stockPrice.value.toString()),
    };
  };
}
