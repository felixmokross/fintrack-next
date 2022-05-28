import { Dayjs } from "dayjs";
import { groupBy } from "lodash";
import { Db } from "mongodb";
import { globalOpeningDate } from "../../pages/shared/global-opening-date.server";
import {
  deserializeMonthPeriod,
  MonthPeriod,
  Period,
  serializePeriod,
} from "../../pages/shared/periods/documents.server";
import { PeriodType } from "../../pages/shared/periods/enums";
import { PeriodModel } from "../../pages/shared/periods/model.server";
import { serializeDate } from "../../pages/shared/serialization.server";
import { Stopwatch } from "./stopwatch.server";
import sumPeriods from "./sum-periods.server";

export default async function recalculateYearPeriods(
  db: Db,
  stopwatch: Stopwatch,
  endDate: Dayjs,
  startDate?: Dayjs
): Promise<void> {
  console.log("preparing");
  const startYear = (startDate || globalOpeningDate()).startOf("year");
  const endYear = endDate.startOf("year");

  const monthPeriodsByYear = groupBy(await readMonthPeriods(), (mp) =>
    mp._id.year()
  );

  stopwatch.logLeap();
  console.log("calculating year periods");

  const yearPeriods = new Array<PeriodModel>(
    endYear.diff(startYear, "year") + 1
  );
  for (
    let i = 0, currentYear = startYear;
    i < yearPeriods.length;
    i++, currentYear = currentYear.add(1, "year")
  ) {
    console.log(currentYear.format("YYYY"));

    yearPeriods[i] = sumPeriods(
      currentYear,
      PeriodType.YEAR,
      monthPeriodsByYear[currentYear.year()]
    );
  }

  stopwatch.logLeap();
  console.log("writing data");
  await deleteYearPeriods();
  await storeYearPeriods(yearPeriods);

  stopwatch.logLeap();

  async function readMonthPeriods(): Promise<readonly PeriodModel[]> {
    return (
      await db
        .collection<MonthPeriod>("monthPeriods")
        .find({
          $and: [
            { _id: { $gte: serializeDate(startYear) } },
            {
              _id: {
                $lte: serializeDate(endYear.endOf("year").startOf("month")),
              },
            },
          ],
        })
        .toArray()
    ).map(deserializeMonthPeriod);
  }

  async function deleteYearPeriods(): Promise<void> {
    await db
      .collection<Period>("yearPeriods")
      .deleteMany({ _id: { $gte: serializeDate(startYear) } });
  }

  async function storeYearPeriods(
    yearPeriods: readonly PeriodModel[]
  ): Promise<void> {
    await db
      .collection<Period>("yearPeriods")
      .insertMany(yearPeriods.map(serializePeriod));
  }
}
