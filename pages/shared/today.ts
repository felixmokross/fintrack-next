import dayjs from "dayjs";

export function today() {
  return dayjs.utc().startOf("day");
}
