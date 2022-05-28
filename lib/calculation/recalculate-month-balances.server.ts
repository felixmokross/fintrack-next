import { Dayjs } from "dayjs";
import { Db } from "mongodb";
import {
  MonthBalances,
  serializeMonthBalances,
} from "../../pages/shared/balances/documents.server";
import {
  DayBalancesModel,
  MonthBalancesModel,
} from "../../pages/shared/balances/model.server";
import { AccountModel } from "../../pages/shared/accounts/model.server";
import { serializeDate } from "../../pages/shared/serialization.server";
import { calculateNewMonthBalances } from "./calculate-new-month-balances.server";
import { globalOpeningDate } from "../../pages/shared/global-opening-date.server";

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
