import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { BookingType } from "./enums";
import { AccountUnitModel } from "../accounts/model.server";

export interface TransactionModel {
  _id: string;
  date: Dayjs;
  note?: string;
  bookings: readonly BookingModel[];
}

export type BookingModel =
  | ChargeModel
  | DepositModel
  | IncomeModel
  | ExpenseModel
  | AppreciationModel
  | DepreciationModel;
interface CommonBookingModel {
  type: BookingType;
}

export interface ChargeModel extends CommonBookingModel {
  type: BookingType.CHARGE;
  note?: string;
  accountId: string;
  unit: AccountUnitModel;
  amount: Decimal;
}

export interface DepositModel extends CommonBookingModel {
  type: BookingType.DEPOSIT;
  note?: string;
  accountId: string;
  unit: AccountUnitModel;
  amount: Decimal;
}

export interface IncomeModel extends CommonBookingModel {
  type: BookingType.INCOME;
  note?: string;
  incomeCategoryId: string;
  currency: string;
  amount: Decimal;
}

export interface ExpenseModel extends CommonBookingModel {
  type: BookingType.EXPENSE;
  note?: string;
  expenseCategoryId: string;
  currency: string;
  amount: Decimal;
}

export interface AppreciationModel extends CommonBookingModel {
  type: BookingType.APPRECIATION;
  amount: Decimal;
}

export interface DepreciationModel extends CommonBookingModel {
  type: BookingType.DEPRECIATION;
  amount: Decimal;
}
