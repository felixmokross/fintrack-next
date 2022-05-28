import { Decimal128, ObjectId } from "mongodb";
import {
  deserializeDate,
  deserializeDecimal,
  deserializeId,
  serializeDate,
  serializeDecimal,
  serializeId,
} from "../serialization.server";
import {
  Booking,
  deserializeBooking,
  serializeBooking,
} from "../transactions/documents.server";
import { DayLedgerModel } from "./model.server";

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

export function serializeDayLedger(dayLedger: DayLedgerModel): DayLedger {
  return {
    ...dayLedger,
    _id: {
      accountId: serializeId(dayLedger._id.accountId),
      date: serializeDate(dayLedger._id.date),
    },
    change: serializeDecimal(dayLedger.change),
    balance: serializeDecimal(dayLedger.balance),
    lines: dayLedger.lines.map((l) => ({
      ...l,
      transactionId: serializeId(l.transactionId),
      value: serializeDecimal(l.value),
      bookings: l.bookings.map(serializeBooking),
    })),
  };
}

export function deserializeDayLedger(dayLedger: DayLedger): DayLedgerModel {
  return {
    ...dayLedger,
    _id: {
      accountId: deserializeId(dayLedger._id.accountId),
      date: deserializeDate(dayLedger._id.date),
    },
    change: deserializeDecimal(dayLedger.change),
    balance: deserializeDecimal(dayLedger.balance),
    lines: dayLedger.lines.map((l) => ({
      ...l,
      transactionId: deserializeId(l.transactionId),
      value: deserializeDecimal(l.value),
      bookings: l.bookings.map(deserializeBooking),
    })),
  };
}
