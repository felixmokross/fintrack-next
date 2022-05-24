import dayjs, { Dayjs } from "dayjs";
import Decimal, { Numeric } from "decimal.js-light";
import { Decimal128, ObjectId } from "mongodb";

export function serializeDecimal(value: Numeric): Decimal128 {
  return Decimal128.fromString(value.toString());
}

export function deserializeDecimal(value: Decimal128): Decimal {
  return new Decimal(value.toString());
}

export function serializeId(id: string): ObjectId {
  return new ObjectId(id);
}

export function deserializeId(id: ObjectId): string {
  return id.toHexString();
}

export function serializeDate(date: Dayjs): Date {
  return date.toDate();
}

export function deserializeDate(value: Date): Dayjs {
  return dayjs.utc(value);
}
