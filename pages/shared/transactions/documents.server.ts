import { Decimal128, ObjectId } from "mongodb";
import {
  deserializeDate,
  deserializeDecimal,
  deserializeId,
  serializeDecimal,
  serializeId,
} from "../serialization.server";
import {
  Account,
  AccountUnit,
  deserializeAccountUnit,
  serializeAccountUnit,
} from "../accounts/documents.server";
import { ensure } from "../util";
import { BookingType } from "./enums";
import {
  AppreciationModel,
  BookingModel,
  ChargeModel,
  DepositModel,
  DepreciationModel,
  ExpenseModel,
  IncomeModel,
  TransactionModel,
} from "./model.server";
import {
  SaveTransactionBookingDto,
  SaveTransactionChargeDto,
  SaveTransactionDepositDto,
} from "./dtos";

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

export function serializeBooking(booking: BookingModel): Booking {
  switch (booking.type) {
    case BookingType.CHARGE:
    case BookingType.DEPOSIT:
      return serializeChargeOrDeposit(booking);
    case BookingType.APPRECIATION:
    case BookingType.DEPRECIATION:
      return serializeAppreciationOrDepreciation(booking);
    case BookingType.EXPENSE:
      return serializeExpense(booking);
    case BookingType.INCOME:
      return serializeIncome(booking);
  }
}

function serializeChargeOrDeposit(
  chargeOrDeposit: ChargeModel | DepositModel
): SerializedChargeOrDeposit<typeof chargeOrDeposit> {
  return {
    ...chargeOrDeposit,
    accountId: serializeId(chargeOrDeposit.accountId),
    amount: serializeDecimal(chargeOrDeposit.amount),
    unit: serializeAccountUnit(chargeOrDeposit.unit),
  };
}

type SerializedChargeOrDeposit<T extends ChargeModel | DepositModel> =
  T extends ChargeModel ? Charge : Deposit;

function serializeAppreciationOrDepreciation(
  appreciationOrDepreciation: AppreciationModel | DepreciationModel
): SerializedAppreciationOrDepreciation<typeof appreciationOrDepreciation> {
  return {
    ...appreciationOrDepreciation,
    amount: serializeDecimal(appreciationOrDepreciation.amount),
  };
}

type SerializedAppreciationOrDepreciation<
  T extends AppreciationModel | DepreciationModel
> = T extends AppreciationModel ? Appreciation : Depreciation;

function serializeExpense(expense: ExpenseModel): Expense {
  return {
    ...expense,
    amount: serializeDecimal(expense.amount),
    expenseCategoryId: serializeId(expense.expenseCategoryId),
  };
}

function serializeIncome(income: IncomeModel): Income {
  return {
    ...income,
    amount: serializeDecimal(income.amount),
    incomeCategoryId: serializeId(income.incomeCategoryId),
  };
}

export function deserializeBooking(booking: Booking): BookingModel {
  switch (booking.type) {
    case BookingType.CHARGE:
    case BookingType.DEPOSIT:
      return deserializeChargeOrDeposit(booking);
    case BookingType.APPRECIATION:
    case BookingType.DEPRECIATION:
      return deserializeAppreciationOrDepreciation(booking);
    case BookingType.INCOME:
      return deserializeIncome(booking);
    case BookingType.EXPENSE:
      return deserializeExpense(booking);
  }
}

function deserializeExpense(expense: Expense): ExpenseModel {
  return {
    ...expense,
    expenseCategoryId: deserializeId(expense.expenseCategoryId),
    amount: deserializeDecimal(expense.amount),
  };
}

function deserializeIncome(income: Income): IncomeModel {
  return {
    ...income,
    incomeCategoryId: deserializeId(income.incomeCategoryId),
    amount: deserializeDecimal(income.amount),
  };
}

function deserializeAppreciationOrDepreciation(
  appreciationOrDepreciation: Appreciation | Depreciation
): DeserializedAppreciationOrDepreciation<typeof appreciationOrDepreciation> {
  return {
    ...appreciationOrDepreciation,
    amount: deserializeDecimal(appreciationOrDepreciation.amount),
  };
}

type DeserializedAppreciationOrDepreciation<
  T extends Appreciation | Depreciation
> = T extends Appreciation ? AppreciationModel : DepreciationModel;

function deserializeChargeOrDeposit(
  chargeOrDeposit: Charge | Deposit
): DeserializedChargeOrDeposit<typeof chargeOrDeposit> {
  return {
    ...chargeOrDeposit,
    accountId: deserializeId(chargeOrDeposit.accountId),
    amount: deserializeDecimal(chargeOrDeposit.amount),
    unit: deserializeAccountUnit(chargeOrDeposit.unit),
  };
}

type DeserializedChargeOrDeposit<T extends Charge | Deposit> = T extends Charge
  ? ChargeModel
  : DepositModel;

export function deserializeTransaction(
  transaction: Transaction
): TransactionModel {
  return {
    ...transaction,
    _id: deserializeId(ensure(transaction._id)),
    date: deserializeDate(transaction.date),
    bookings: transaction.bookings.map(deserializeBooking),
  };
}

export function toBooking(
  dto: SaveTransactionBookingDto,
  accounts: readonly Account[]
): Booking {
  switch (dto.type) {
    case BookingType.CHARGE:
    case BookingType.DEPOSIT:
      return toChargeOrDeposit(dto, accounts);
    case BookingType.INCOME:
      return {
        type: BookingType.INCOME,
        note: dto.note,
        incomeCategoryId: serializeId(dto.incomeCategoryId),
        currency: dto.currency,
        amount: serializeDecimal(dto.amount),
      } as Income;
    case BookingType.EXPENSE:
      return {
        type: BookingType.EXPENSE,
        note: dto.note,
        expenseCategoryId: serializeId(dto.expenseCategoryId),
        currency: dto.currency,
        amount: serializeDecimal(dto.amount),
      } as Expense;
    case BookingType.APPRECIATION:
    case BookingType.DEPRECIATION:
      return {
        type: dto.type,
        amount: serializeDecimal(dto.amount),
      };
  }
}

function toChargeOrDeposit(
  dto: SaveTransactionChargeDto | SaveTransactionDepositDto,
  accounts: readonly Account[]
): Charge | Deposit {
  const accountId = serializeId(dto.accountId);
  const account = accounts.find((a) => ensure(a._id).equals(accountId));
  if (!account)
    throw new Error(`Account ${accountId.toHexString()} not found!`);

  return {
    type: dto.type,
    note: dto.note,
    accountId,
    unit: account.unit,
    amount: serializeDecimal(dto.amount),
  } as Charge | Deposit;
}
