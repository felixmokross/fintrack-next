import { Dayjs } from "dayjs";
import { Db } from "mongodb";
import { MonthBalances } from "../documents.server";
import { globalOpeningDate } from "../global-opening-date.server";
import {
  AccountModel,
  DayBalancesModel,
  MonthBalancesModel,
} from "../model.server";
import { serializeDate, serializeMonthBalances } from "../serialization.server";
import { calculateNewMonthBalances } from "./calculate-new-month-balances.server";

export async function recalculateMonthBalances(
  db: Db,
  dayBalances: readonly DayBalancesModel[],
  accounts: readonly AccountModel[],
  startDate?: Dayjs
): Promise<void> {
  const monthBalances = calculateNewMonthBalances(dayBalances, accounts);

  await deleteMonthBalances(startDate);
  await storeMonthBalances(monthBalances);

  async function deleteMonthBalances(startDate?: Dayjs): Promise<void> {
    await db.collection<MonthBalances>("monthBalances").deleteMany({
      _id: {
        $gte: serializeDate(
          (startDate || globalOpeningDate()).startOf("month")
        ),
      },
    });
  }

  async function storeMonthBalances(
    monthBalances: readonly MonthBalancesModel[]
  ): Promise<void> {
    await db
      .collection<MonthBalances>("monthBalances")
      .insertMany(monthBalances.map(serializeMonthBalances));
  }
}
