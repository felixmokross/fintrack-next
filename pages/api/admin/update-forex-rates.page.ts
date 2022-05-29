import dayjs, { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { difference, groupBy } from "lodash";
import { Db, Decimal128 } from "mongodb";
import { NextApiHandler } from "next";
import {
  Currency,
  ForexRateSource,
} from "../../shared/currencies/documents.server";
import { ForexRate } from "../../shared/forex-rates/documents.server";
import { globalOpeningDate } from "../../shared/global-opening-date.server";
import { today } from "../../shared/today";
import { byKey } from "../../shared/util";
import { getAdminTenantDb } from "../../shared/util.server";
import { withAdminApiAuth } from "./auth";

const handleUpdateForexRates: NextApiHandler = withAdminApiAuth(
  async (_, res) => {
    const db = await getAdminTenantDb();
    await updateForexRates(db);
    res.json({ message: "success" });
  }
);

export default handleUpdateForexRates;

const baseCurrencyIsoCode = "USD";
const currencylayerApiKey = process.env.CURRENCYLAYER_API_KEY;
if (!currencylayerApiKey) {
  throw new Error("Currencylayer API key not configured");
}

const coinlayerApiKey = process.env.COINLAYER_API_KEY;
if (!coinlayerApiKey) {
  throw new Error("Coinlayer API key not configured");
}

async function updateForexRates(db: Db): Promise<void> {
  const fromDate = globalOpeningDate().subtract(1, "day");
  const toDate = today().subtract(1, "day");

  console.info(`updating forex rates to ${toDate.format("YYYY-MM-DD")}`);
  console.log("reading currencies from db");

  const currencies = await db
    .collection<Currency>("currencies")
    .find({ blacklisted: false, _id: { $ne: baseCurrencyIsoCode } })
    .toArray();
  const currenciesByCode = byKey(currencies, (c) => c._id);

  const missingCurrencyCodesByDate: Array<{
    date: Dayjs;
    currencyCodes: readonly string[];
  }> = [];

  console.log("reading forex rates from db");
  const forexRates = await db
    .collection<ForexRate>("forexRates")
    .find()
    .toArray();

  console.log("grouping");
  const forexRatesByDate = groupBy(forexRates, (fr) => fr._id.date.valueOf());

  console.log("analyzing");
  let currentDate = fromDate;
  while (currentDate.isSameOrBefore(toDate)) {
    const existingCurrencyCodes = (
      forexRatesByDate[currentDate.valueOf()] || []
    ).map((fr) => fr._id.currency);

    const currencyCodes = difference(
      currencies
        .filter((c) => currentDate.isSameOrAfter(dayjs.utc(c.startDate), "day"))
        .map((c) => c._id),
      existingCurrencyCodes
    );

    if (currencyCodes.length > 0) {
      missingCurrencyCodesByDate.push({
        date: currentDate,
        currencyCodes,
      });
    }

    currentDate = currentDate.add(1, "day");
  }

  console.info(
    `found missing forex rates on ${missingCurrencyCodesByDate.length} days`
  );
  if (missingCurrencyCodesByDate.length > 50) {
    throw new Error("threshold exceeded -- aborting");
  }

  for (const { date, currencyCodes } of missingCurrencyCodesByDate) {
    console.info(
      `${currencyCodes.length} missing forex rates for ${date.format(
        "YYYY-MM-DD"
      )}`
    );

    const currencyInfos = currencyCodes.map((c) => currenciesByCode[c]);

    await updateForexRatesFromCurrencylayerAsync(
      date,
      currencyInfos
        .filter((ci) => ci.forexRateSource === ForexRateSource.CURRENCYLAYER)
        .map((ci) => ci._id),
      db
    );

    await updateForexRatesFromCoinlayerAsync(
      date,
      currencyInfos
        .filter((ci) => ci.forexRateSource === ForexRateSource.COINLAYER)
        .map((ci) => ci._id),
      db
    );
  }

  console.info("done updating forex rates");
}

async function updateForexRatesFromCurrencylayerAsync(
  date: Dayjs,
  currencyCodes: readonly string[],
  db: Db
) {
  if (currencyCodes.length === 0) {
    return;
  }

  const url =
    "http://api.currencylayer.com/historical" +
    `?access_key=${currencylayerApiKey}` +
    `&date=${date.format("YYYY-MM-DD")}` +
    `&source=${baseCurrencyIsoCode}` +
    `&currencies=${currencyCodes.join(",")}`;
  console.log(`GET ${url.replace(currencylayerApiKey!, "[MASKED]")}`);
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      `GET ${url.replace(
        currencylayerApiKey!,
        "[MASKED]"
      )} returned status code ${response.status}: ${await response.text()}`
    );

  const currencylayerResponse =
    (await response.json()) as CurrencylayerHistoricalResponseDto;
  console.log(JSON.stringify(currencylayerResponse, null, 2));

  if (!currencylayerResponse.success) {
    console.warn("request failed, skipping date");
    return;
  }

  const forexRates = Object.entries(currencylayerResponse.quotes!).map(
    ([pairKey, rate]) => {
      const match = /[A-Z]{3}$/.exec(pairKey);
      if (!match || !match[0]) {
        throw new Error(`Could not parse pair key ${pairKey}`);
      }

      return {
        _id: {
          date: date.toDate(),
          currency: match[0],
        },
        value: Decimal128.fromString(rate.toString()),
      } as ForexRate;
    }
  );

  for (const forexRate of forexRates) {
    await db
      .collection<ForexRate>("forexRates")
      .replaceOne({ _id: forexRate._id }, forexRate, {
        upsert: true,
      });
  }

  console.info(
    `updated forex rates for ${date.format("YYYY-MM-DD")} from currencylayer`
  );
}

async function updateForexRatesFromCoinlayerAsync(
  date: Dayjs,
  currencyCodes: readonly string[],
  db: Db
) {
  if (currencyCodes.length === 0) {
    return;
  }

  const url =
    `http://api.coinlayer.com/${date.format("YYYY-MM-DD")}` +
    `?access_key=${coinlayerApiKey}` +
    `&target=${baseCurrencyIsoCode}` +
    `&symbols=${currencyCodes.join(",")}`;
  console.log(`GET ${url.replace(coinlayerApiKey!, "[MASKED]")}`);
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      `GET ${url.replace(coinlayerApiKey!, "[MASKED]")} returned status code ${
        response.status
      }: ${await response.text()}`
    );

  const coinlayerResponse =
    (await response.json()) as CoinlayerHistoricalResponseDto;
  console.log(JSON.stringify(coinlayerResponse, null, 2));

  if (!coinlayerResponse.success) {
    console.warn("request failed, skipping date");
    return;
  }

  const forexRates = Object.entries(coinlayerResponse.rates!).map(
    ([symbol, rate]) => {
      return {
        _id: {
          date: date.toDate(),
          currency: symbol,
        },
        value: Decimal128.fromString(new Decimal(1).dividedBy(rate).toString()),
      } as ForexRate;
    }
  );

  for (const forexRate of forexRates) {
    await db
      .collection<ForexRate>("forexRates")
      .replaceOne({ _id: forexRate._id }, forexRate, {
        upsert: true,
      });
  }

  console.info(
    `updated forex rates for ${date.format("YYYY-MM-DD")} from coinlayer`
  );
}

interface CurrencylayerHistoricalResponseDto {
  success: boolean;
  quotes?: {
    [pairKey: string]: number;
  };
}

interface CoinlayerHistoricalResponseDto {
  success: boolean;
  rates?: {
    [symbol: string]: number;
  };
}
