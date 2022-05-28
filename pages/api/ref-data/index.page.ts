import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import {
  Currency,
  toCurrencyDto,
} from "../../shared/currencies/documents.server";
import { getDb } from "../../shared/mongodb.server";
import { RefDataDto } from "../../shared/ref-data/dtos";
import { Stock } from "../../shared/stocks/documents.server";
import { StockDto } from "../../shared/stocks/dtos";
import { byKey, ensure } from "../../shared/util";

export default withApiAuthRequired(async function getRefData(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  const db = await getDb();

  const [currencies, stocks] = await Promise.all([
    getCurrencies(),
    getStocks(),
  ]);

  return res.json({ currencies, stocks } as RefDataDto);

  async function getCurrencies() {
    return byKey(
      (
        await db
          .collection<Currency>("currencies")
          .find({ blacklisted: false })
          .sort({ _id: 1 })
          .toArray()
      ).map(toCurrencyDto),
      (c) => c._id
    );
  }

  async function getStocks() {
    return byKey(
      (await db.collection<Stock>("stocks").find().toArray()).map(toStockDto),
      (c) => c._id
    );
  }
});

function toStockDto(stock: Stock): StockDto {
  return {
    _id: ensure(stock._id).toHexString(),
    symbol: stock.symbol,
    tradingCurrency: stock.tradingCurrency,
  };
}
