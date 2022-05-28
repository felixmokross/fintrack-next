import { Dayjs } from "dayjs";
import { Db } from "mongodb";
import { AccountModel } from "../../accounts/model.server";
import {
  DayLedger,
  deserializeDayLedger,
} from "../../day-ledgers/documents.server";
import { DayLedgerModel } from "../../day-ledgers/model.server";
import { RateProvider } from "../../forex-rates/functions.server";
import { globalOpeningDate } from "../../global-opening-date.server";
import { serializeDate } from "../../serialization.server";
import { StockPriceProvider } from "../../stock-prices/functions.server";
import { Stopwatch } from "../../stopwatch.server";
import { DayBalances, serializeDayBalances } from "../documents.server";
import { DayBalancesModel } from "../model.server";
import { calculateNewDayBalances } from "./calculate-new-day-balances.server";

export async function recalculateDayBalances(
  db: Db,
  rateProvider: RateProvider,
  stockPriceProvider: StockPriceProvider,
  stopwatch: Stopwatch,
  baseDayBalances: DayBalancesModel,
  endDate: Dayjs,
  accounts: readonly AccountModel[],
  startDate?: Dayjs
): Promise<readonly DayBalancesModel[]> {
  console.log("reading data");
  const dayLedgers = await readDayLedgers(startDate);

  stopwatch.logLeap();
  console.log("calculating new day balances");
  const dayBalances = calculateNewDayBalances(
    baseDayBalances,
    dayLedgers,
    accounts,
    endDate,
    rateProvider,
    stockPriceProvider
  );

  stopwatch.logLeap();
  console.log("writing data");
  await deleteDayBalances(startDate);
  await storeDayBalances(dayBalances);

  stopwatch.logLeap();
  return dayBalances;

  async function readDayLedgers(
    startDate?: Dayjs
  ): Promise<readonly DayLedgerModel[]> {
    return (
      await (startDate
        ? db
            .collection<DayLedger>("dayLedgers")
            .find({ "_id.date": { $gte: serializeDate(startDate) } })
        : db.collection<DayLedger>("dayLedgers").find()
      ).toArray()
    ).map(deserializeDayLedger);
  }

  async function deleteDayBalances(startDate?: Dayjs): Promise<void> {
    await db.collection<DayBalances>("dayBalances").deleteMany({
      _id: { $gte: serializeDate(startDate || globalOpeningDate()) },
    });
  }

  async function storeDayBalances(
    dayBalances: readonly DayBalancesModel[]
  ): Promise<void> {
    await db
      .collection<DayBalances>("dayBalances")
      .insertMany(dayBalances.map(serializeDayBalances));
  }
}
