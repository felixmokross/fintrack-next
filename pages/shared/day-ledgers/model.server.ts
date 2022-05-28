import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { BookingModel } from "../transactions/model.server";

export interface DayLedgerModel {
  _id: DayLedgerIdModel;
  lines: readonly DayLedgerLineModel[];
  change: Decimal;
  balance: Decimal;
}

export interface DayLedgerIdModel {
  accountId: string;
  date: Dayjs;
}

export interface DayLedgerLineModel {
  transactionId: string;
  note?: string;
  bookings: readonly BookingModel[];
  value: Decimal;
}
