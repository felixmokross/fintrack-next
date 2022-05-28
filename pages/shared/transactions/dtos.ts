import { AccountUnitDto } from "../accounts/dtos";
import { BookingType } from "./enums";

export type SaveTransactionDto = Pick<TransactionDto, "date" | "note"> & {
  bookings: readonly SaveTransactionBookingDto[];
};

export type SaveTransactionBookingDto =
  | SaveTransactionChargeDto
  | SaveTransactionDepositDto
  | SaveTransactionIncomeDto
  | SaveTransactionExpenseDto
  | SaveTransactionAppreciationDto
  | SaveTransactionDepreciationDto;
export type SaveTransactionChargeDto = Pick<
  ChargeDto,
  "accountId" | "amount" | "note" | "type"
>;
export type SaveTransactionDepositDto = Pick<
  DepositDto,
  "accountId" | "amount" | "note" | "type"
>;
export type SaveTransactionIncomeDto = IncomeDto;
export type SaveTransactionExpenseDto = ExpenseDto;
export type SaveTransactionAppreciationDto = AppreciationDto;
export type SaveTransactionDepreciationDto = DepreciationDto;

export interface TransactionDto {
  _id: string;
  date: string;
  note?: string;
  bookings: readonly BookingDto[];
}

export type BookingDto =
  | ChargeDto
  | DepositDto
  | IncomeDto
  | ExpenseDto
  | AppreciationDto
  | DepreciationDto;

interface CommonBookingDto {
  type: BookingType;
}

export interface ChargeDto extends CommonBookingDto {
  type: BookingType.CHARGE;
  note?: string;
  accountId: string;
  unit: AccountUnitDto;
  amount: string;
}

export interface DepositDto extends CommonBookingDto {
  type: BookingType.DEPOSIT;
  note?: string;
  accountId: string;
  unit: AccountUnitDto;
  amount: string;
}

export interface IncomeDto extends CommonBookingDto {
  type: BookingType.INCOME;
  note?: string;
  incomeCategoryId: string;
  currency: string;
  amount: string;
}

export interface ExpenseDto extends CommonBookingDto {
  type: BookingType.EXPENSE;
  note?: string;
  expenseCategoryId: string;
  currency: string;
  amount: string;
}

export interface AppreciationDto extends CommonBookingDto {
  type: BookingType.APPRECIATION;
  amount: string;
}

export interface DepreciationDto extends CommonBookingDto {
  type: BookingType.DEPRECIATION;
  amount: string;
}
