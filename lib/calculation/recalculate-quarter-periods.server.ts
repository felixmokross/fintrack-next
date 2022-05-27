import { Dayjs } from "dayjs";
import { groupBy } from "lodash";
import { Db } from "mongodb";
import { MonthPeriod, Period } from "../documents.server";
import { PeriodType } from "../enums";
import { globalOpeningDate } from "../global-opening-date.server";
import { PeriodModel } from "../model.server";
import {
  deserializeMonthPeriod,
  serializeDate,
  serializePeriod,
} from "../serialization.server";
import { Stopwatch } from "./stopwatch.server";
import sumPeriods from "./sum-periods.server";

export default async function recalculateQuarterPeriods(
  db: Db,
  stopwatch: Stopwatch,
  endDate: Dayjs,
  startDate?: Dayjs
): Promise<void> {
  console.log("preparing");
  const startQuarter = (startDate || globalOpeningDate()).startOf("quarter");
  const endQuarter = endDate.startOf("quarter");

  const monthPeriodsByQuarter = groupBy(await readMonthPeriods(), (mp) =>
    mp._id.format("YYYYQ")
  );

  stopwatch.logLeap();
  console.log("calculating quarter periods");

  const quarterPeriods = new Array<PeriodModel>(
    endQuarter.diff(startQuarter, "quarter") + 1
  );
  for (
    let i = 0, currentQuarter = startQuarter;
    i < quarterPeriods.length;
    i++, currentQuarter = currentQuarter.add(1, "quarter")
  ) {
    console.log(currentQuarter.format("YYYY-[Q]Q"));

    quarterPeriods[i] = sumPeriods(
      currentQuarter,
      PeriodType.QUARTER,
      monthPeriodsByQuarter[currentQuarter.format("YYYYQ")]
    );
  }

  stopwatch.logLeap();
  console.log("writing data");
  await deleteQuarterPeriods();
  await storeQuarterPeriods(quarterPeriods);

  stopwatch.logLeap();

  // TODO re-use for years -- or maybe base years on quarters?
  async function readMonthPeriods(): Promise<readonly PeriodModel[]> {
    return (
      await db
        .collection<MonthPeriod>("monthPeriods")
        .find({
          $and: [
            { _id: { $gte: serializeDate(startQuarter) } },
            {
              _id: {
                $lte: serializeDate(endQuarter.endOf("year").startOf("month")),
              },
            },
          ],
        })
        .toArray()
    ).map(deserializeMonthPeriod);
  }

  async function deleteQuarterPeriods(): Promise<void> {
    await db
      .collection<Period>("quarterPeriods")
      .deleteMany({ _id: { $gte: serializeDate(startQuarter) } });
  }

  async function storeQuarterPeriods(
    quarterPeriods: readonly PeriodModel[]
  ): Promise<void> {
    await db
      .collection<Period>("quarterPeriods")
      .insertMany(quarterPeriods.map(serializePeriod));
  }
}
