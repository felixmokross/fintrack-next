import { FormValues } from "../forms/types";
import { BookingType } from "./enums";

export interface TransactionFormValues extends FormValues {
  date: string;
  note: string;
  bookings: readonly BookingFormValues[];
}

export type BookingFormValues =
  | ChargeDepositFormValues
  | ExpenseFormValues
  | IncomeFormValues;

export interface ChargeDepositFormValues {
  type: BookingType.CHARGE | BookingType.DEPOSIT;
  note: string;
  accountId: string;
  amount: string;
}

export interface ExpenseFormValues {
  type: BookingType.EXPENSE;
  note: string;
  expenseCategoryId: string;
  currency: string;
  amount: string;
}

export interface IncomeFormValues {
  type: BookingType.INCOME;
  note: string;
  incomeCategoryId: string;
  currency: string;
  amount: string;
}

export interface ValueChangeFormValues {
  date: string;
  note: string;
  valueChange: string;
}
