import { Decimal128, ObjectId } from "mongodb";
import { Booking } from "../transactions/documents.server";

export interface DayLedger {
  _id: DayLedgerId;
  lines: readonly DayLedgerLine[];
  change: Decimal128;
  balance: Decimal128;
}

export interface DayLedgerId {
  accountId: ObjectId;
  date: Date;
}

export interface DayLedgerLine {
  transactionId: ObjectId;
  note?: string;
  bookings: readonly Booking[];
  value: Decimal128;
}
