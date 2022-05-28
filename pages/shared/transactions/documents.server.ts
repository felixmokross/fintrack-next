import { Decimal128, ObjectId } from "mongodb";
import { AccountUnit } from "../accounts/documents.server";
import { BookingType } from "./enums";

export interface Transaction {
  _id?: ObjectId;
  date: Date;
  note?: string;
  bookings: readonly Booking[];
}

export type Booking =
  | Charge
  | Deposit
  | Income
  | Expense
  | Appreciation
  | Depreciation;
interface CommonBooking {
  type: BookingType;
}

export interface Charge extends CommonBooking {
  type: BookingType.CHARGE;
  note?: string;
  accountId: ObjectId;
  unit: AccountUnit; // TODO is the unit required on the booking? on client side we now cope without it
  amount: Decimal128;
}

export interface Deposit extends CommonBooking {
  type: BookingType.DEPOSIT;
  note?: string;
  accountId: ObjectId;
  unit: AccountUnit; // TODO is the unit required on the booking? on client side we now cope without it
  amount: Decimal128;
}

export interface Income extends CommonBooking {
  type: BookingType.INCOME;
  note?: string;
  incomeCategoryId: ObjectId;
  currency: string;
  amount: Decimal128;
}

export interface Expense extends CommonBooking {
  type: BookingType.EXPENSE;
  note?: string;
  expenseCategoryId: ObjectId;
  currency: string;
  amount: Decimal128;
}

export interface Appreciation extends CommonBooking {
  type: BookingType.APPRECIATION;
  amount: Decimal128;
}

export interface Depreciation extends CommonBooking {
  type: BookingType.DEPRECIATION;
  amount: Decimal128;
}
