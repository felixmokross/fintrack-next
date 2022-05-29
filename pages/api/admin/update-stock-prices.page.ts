import dayjs, { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { Db, Decimal128 } from "mongodb";
import { NextApiHandler } from "next";
import {
  convertToCurrency,
  getDbRateProviderAsync,
  RateProvider,
} from "../../shared/forex-rates/functions.server";
import { globalOpeningDate } from "../../shared/global-opening-date.server";
import { StockPrice } from "../../shared/stock-prices/documents.server";
import { Stock } from "../../shared/stocks/documents.server";
import { today } from "../../shared/today";
import { ensure } from "../../shared/util";
import { getAdminTenantDb } from "../../shared/util.server";
import { withAdminApiAuth } from "./auth";

const handleUpdateStockPrices: NextApiHandler = withAdminApiAuth(
  async (_, res) => {
    const db = await getAdminTenantDb();
    await updateStockPrices(db);
    res.json({ message: "success" });
  }
);

export default handleUpdateStockPrices;

export async function updateStockPrices(db: Db): Promise<void> {
  const rateProvider = await getDbRateProviderAsync(db);
  const stocks = await db.collection<Stock>("stocks").find().toArray();

  const stockPriceLookup = (
    await db.collection<StockPrice>("stockPrices").find().toArray()
  ).reduce<StockPriceLookup>((prev, curr) => {
    const date = dayjs.utc(curr._id.date);
    return {
      ...prev,
      [curr._id.stockId.toHexString()]: {
        ...prev[curr._id.stockId.toHexString()],
        [date.format("YYYYMMDD")]: {
          price: curr.value,
          tradingDate: curr.tradingDate,
          currency: curr.currency,
        },
      },
    };
  }, {});

  const yesterday = today().subtract(1, "day");

  for (const stock of stocks) {
    console.log(`stock ${stock.symbol} (${stock.tradingCurrency})`);

    let workDate = (
      stock.startDate ? dayjs.utc(stock.startDate) : globalOpeningDate()
    ).subtract(1, "day");
    const endDate = stock.endDate ? dayjs.utc(stock.endDate) : yesterday;
    while (workDate.isSameOrBefore(endDate, "day")) {
      let result = getStockPrice(stockPriceLookup, stock, workDate);
      if (result) {
        workDate = workDate.add(1, "day");
        continue;
      }

      result = await retrieveStockPriceAsync(
        stockPriceLookup,
        stock,
        workDate,
        rateProvider
      );

      if (result || !workDate.isSame(yesterday, "day")) {
        await db.collection<StockPrice>("stockPrices").insertOne({
          _id: { date: workDate.toDate(), stockId: stock._id },
          currency: result.currency,
          value: result.price,
          tradingDate: result.tradingDate,
        });
      }

      workDate = workDate.add(1, "day");
    }
  }
}

function getStockPrice(
  lookup: StockPriceLookup,
  stock: Stock,
  date: Dayjs
): { price: Decimal128; tradingDate: Date; currency: string } | undefined {
  const stockPriceByDate = lookup[ensure(stock._id).toHexString()];
  return stockPriceByDate
    ? stockPriceByDate[date.format("YYYYMMDD")]
    : undefined;
}

async function retrieveStockPriceAsync(
  stockPriceLookup: StockPriceLookup,
  stock: Stock,
  date: Dayjs,
  rateProvider: RateProvider
): Promise<{ price: Decimal128; tradingDate: Date; currency: string }> {
  const stockPrice = await requestStockPriceAsync(stock, date);
  if (stockPrice) {
    console.log(stockPrice.toString());

    const storeAsUsd = requiresStockPriceFixForVanguardAllWorldEtf(
      stockPriceLookup,
      stock,
      date,
      stockPrice,
      rateProvider
    );

    const result = {
      price: stockPrice,
      tradingDate: date.toDate(),
      currency: storeAsUsd ? "USD" : stock.tradingCurrency,
    };
    updateStockPriceLookup(stockPriceLookup, stock, date, result);
    return result;
  }

  console.log("no result, trying previous day");

  const previousDate = date.subtract(1, "day");
  const result = getStockPrice(stockPriceLookup, stock, previousDate);
  if (result) {
    console.log("found locally");
    updateStockPriceLookup(stockPriceLookup, stock, date, result);
    return result;
  }

  return await retrieveStockPriceAsync(
    stockPriceLookup,
    stock,
    previousDate,
    rateProvider
  );
}

function requiresStockPriceFixForVanguardAllWorldEtf(
  stockPriceLookup: StockPriceLookup,
  stock: Stock,
  date: Dayjs,
  stockPrice: Decimal128,
  rateProvider: RateProvider
): boolean {
  if (stock.symbol !== "VWRA-LN") {
    return false;
  }

  const previousPrice = getStockPrice(
    stockPriceLookup,
    stock,
    date.subtract(1, "day")
  );
  if (!previousPrice) {
    console.log(
      "cannot fix first VWRA-LN stock price; previous price is required in order to determine price change"
    );
    return false;
  }

  const previousPriceInGbp = convertToCurrency(
    new Decimal(previousPrice.price.toString()),
    previousPrice.currency,
    "GBP",
    dayjs.utc(previousPrice.tradingDate),
    rateProvider
  );
  const priceChange = new Decimal(stockPrice.toString())
    .minus(previousPriceInGbp)
    .dividedBy(previousPriceInGbp);
  if (!priceChange.abs().greaterThan(0.1)) {
    return false;
  }

  console.log(
    `VWRA-LN price change of ${priceChange
      .times(100)
      .toFixed(1)}%, storing price as USD`
  );
  return true;
}

function updateStockPriceLookup(
  lookup: StockPriceLookup,
  stock: Stock,
  date: Dayjs,
  result: { price: Decimal128; tradingDate: Date; currency: string }
): void {
  const key = ensure(stock._id).toHexString();
  if (!lookup[key]) {
    lookup[key] = {};
  }

  lookup[key][date.format("YYYYMMDD")] = result;
}

async function requestStockPriceAsync(
  stock: Stock,
  date: Dayjs
): Promise<Decimal128 | undefined> {
  console.log(`requesting ${stock.symbol} for ${date.format("YYYY-MM-DD")}`);

  if (!process.env.IEX_CLOUD_TOKEN)
    throw new Error("IEX_CLOUD_TOKEN must be set!");
  const url = `https://cloud.iexapis.com/stable/stock/${
    stock.symbol
  }/chart/date/${date.format("YYYYMMDD")}?chartByDay=true&token=${
    process.env.IEX_CLOUD_TOKEN
  }`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      `GET ${url.replace(
        process.env.IEX_CLOUD_TOKEN,
        "[MASKED]"
      )} returned status code ${response.status}: ${await response.text()}`
    );

  const [stockResponse] = (await response.json()) as readonly StockResponse[];
  return stockResponse
    ? Decimal128.fromString(stockResponse.uClose.toString())
    : undefined;
}

interface StockResponse {
  uClose: number;
}

type StockPriceLookup = Record<
  string,
  Record<string, { price: Decimal128; tradingDate: Date; currency: string }>
>;
