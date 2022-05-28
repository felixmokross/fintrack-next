import dayjs, { Dayjs } from "dayjs";
import { ensure } from "./util";

export function globalOpeningDate(): Dayjs {
  return dayjs.utc(ensure(process.env.GLOBAL_OPENING_DATE));
}
