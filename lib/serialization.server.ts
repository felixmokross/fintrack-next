import dayjs, { Dayjs } from "dayjs";
import Decimal, { Numeric } from "decimal.js-light";
import { Decimal128, ObjectId } from "mongodb";
import {
  IncomeExpenseRef,
  IncomeExpensesSection,
  MonthPeriod,
  Period,
  ProfitOrLossEntry,
  TransferProfitOrLossSection,
  ValueProfitOrLossSection,
} from "../pages/shared/periods/documents.server";
import {
  DayBalances,
  MonthBalances,
} from "../pages/shared/balances/documents.server";
import { DayLedger } from "../pages/shared/day-ledgers/documents.server";
import {
  Appreciation,
  Booking,
  Charge,
  Deposit,
  Depreciation,
  Expense,
  Income,
  Transaction,
} from "../pages/shared/transactions/documents.server";
import {
  Account,
  AccountUnit,
  StockAccountUnit,
} from "../pages/shared/accounts/documents.server";
import { BookingType } from "../pages/shared/transactions/enums";
import { AccountUnitKind } from "../pages/shared/accounts/enums";
import {
  IncomeExpenseRefModel,
  IncomeExpensesSectionModel,
  PeriodModel,
  ProfitOrLossEntryModel,
  TransferProfitOrLossSectionModel,
  ValueProfitOrLossSectionModel,
} from "../pages/shared/periods/model.server";
import {
  DayBalancesModel,
  MonthBalancesModel,
} from "../pages/shared/balances/model.server";
import { DayLedgerModel } from "../pages/shared/day-ledgers/model.server";
import {
  AppreciationModel,
  BookingModel,
  ChargeModel,
  DepositModel,
  DepreciationModel,
  ExpenseModel,
  IncomeModel,
  TransactionModel,
} from "../pages/shared/transactions/model.server";
import {
  AccountModel,
  AccountUnitModel,
  StockAccountUnitModel,
} from "../pages/shared/accounts/model.server";
import { ensure, transformRecord } from "../pages/shared/util";

export function serializeDecimal(value: Numeric): Decimal128 {
  return Decimal128.fromString(value.toString());
}

export function deserializeDecimal(value: Decimal128): Decimal {
  return new Decimal(value.toString());
}

export function serializeId(id: string): ObjectId {
  return ObjectId.createFromHexString(id);
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

export function serializeAccountUnit(unit: AccountUnitModel): AccountUnit {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return unit;
    case AccountUnitKind.STOCK:
      return serializeStockAccountUnit(unit);
  }
}

function serializeStockAccountUnit(
  unit: StockAccountUnitModel
): StockAccountUnit {
  return {
    ...unit,
    stockId: serializeId(unit.stockId),
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

export function deserializeAccountUnit(unit: AccountUnit): AccountUnitModel {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return unit;
    case AccountUnitKind.STOCK:
      return deserializeStockAccountUnit(unit);
  }
}

function deserializeStockAccountUnit(
  unit: StockAccountUnit
): StockAccountUnitModel {
  return {
    ...unit,
    stockId: deserializeId(unit.stockId),
  };
}

export function serializeDayBalances(
  dayBalances: DayBalancesModel
): DayBalances {
  return {
    _id: serializeDate(dayBalances._id),
    byAccount: transformRecord(dayBalances.byAccount, (balances) => ({
      balanceInAccountCurrency: serializeDecimal(
        balances.balanceInAccountCurrency
      ),
      balanceInReferenceCurrency: serializeDecimal(
        balances.balanceInReferenceCurrency
      ),
    })),
  };
}

export function serializeMonthBalances(
  monthBalances: MonthBalancesModel
): MonthBalances {
  return {
    ...monthBalances,
    _id: serializeDate(monthBalances._id),
    accountCategories: transformRecord(
      monthBalances.accountCategories,
      serializeDecimal
    ),
    netWorth: serializeDecimal(monthBalances.netWorth),
  };
}

export function deserializeMonthBalances(
  monthBalances: MonthBalances
): MonthBalancesModel {
  return {
    ...monthBalances,
    _id: deserializeDate(monthBalances._id),
    accountCategories: transformRecord(
      monthBalances.accountCategories,
      deserializeDecimal
    ),
    netWorth: deserializeDecimal(monthBalances.netWorth),
  };
}

export function deserializeDayBalances(
  dayBalances: DayBalances
): DayBalancesModel {
  return {
    _id: deserializeDate(dayBalances._id),
    byAccount: transformRecord(dayBalances.byAccount, (balances) => ({
      balanceInAccountCurrency: deserializeDecimal(
        balances.balanceInAccountCurrency
      ),
      balanceInReferenceCurrency: deserializeDecimal(
        balances.balanceInReferenceCurrency
      ),
    })),
  };
}

export function deserializeAccount(a: Account): AccountModel {
  return {
    ...a,
    _id: deserializeId(ensure(a._id)),
    categoryId: deserializeId(a.categoryId),
    closingDate: a.closingDate ? deserializeDate(a.closingDate) : undefined,
    currentBalance: {
      valueInReferenceCurrency: deserializeDecimal(
        a.currentBalance.valueInReferenceCurrency
      ),
      valueInAccountUnit: deserializeDecimal(
        a.currentBalance.valueInAccountUnit
      ),
    },
    valueTypeId: a.valueTypeId ? deserializeId(a.valueTypeId) : undefined,
    valueSubtypeId: a.valueSubtypeId
      ? deserializeId(a.valueSubtypeId)
      : undefined,
    groupId: a.groupId ? deserializeId(a.groupId) : undefined,
    openingBalance: a.openingBalance
      ? deserializeDecimal(a.openingBalance)
      : undefined,
    openingDate: a.openingDate ? deserializeDate(a.openingDate) : undefined,
    unit: deserializeAccountUnit(a.unit),
  };
}

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

function serializeIncomeExpensesSection(
  model: IncomeExpensesSectionModel
): IncomeExpensesSection {
  return {
    categories: transformRecord(model.categories, (c) => ({
      bookings: c.bookings.map(serializeIncomeExpenseRef),
      total: serializeDecimal(c.total),
    })),
    total: serializeDecimal(model.total),
  };
}

function serializeIncomeExpenseRef(
  model: IncomeExpenseRefModel
): IncomeExpenseRef {
  return {
    transactionId: serializeId(model.transactionId),
    date: serializeDate(model.date),
    transactionNote: model.transactionNote,
    bookingNote: model.bookingNote,
    currency: model.currency,
    amount: serializeDecimal(model.amount),
    amountInReferenceCurrency: serializeDecimal(
      model.amountInReferenceCurrency
    ),
  };
}

function serializeValueProfitOrLossSection(
  model: ValueProfitOrLossSectionModel
): ValueProfitOrLossSection {
  return {
    currencies: transformRecord(model.currencies, serializeDecimal),
    stocks: transformRecord(model.stocks, serializeDecimal),
    valuatedAccounts: transformRecord(model.valuatedAccounts, serializeDecimal),
    accountCategories: transformRecord(
      model.accountCategories,
      serializeDecimal
    ),
    accounts: transformRecord(model.accounts, serializeDecimal),
    valueTypes: transformRecord(model.valueTypes, serializeDecimal),
    valueSubtypes: transformRecord(model.valueSubtypes, serializeDecimal),
    total: serializeDecimal(model.total),
  };
}

function serializeTransferProfitOrLossSection(
  model: TransferProfitOrLossSectionModel
): TransferProfitOrLossSection {
  return {
    transfers: transformRecord(model.transfers, serializeDecimal),
    total: serializeDecimal(model.total),
  };
}

export function serializePeriod(model: PeriodModel): Period {
  return {
    _id: serializeDate(model._id),
    type: model.type,
    profits: model.profits.map(serializeProfitOrLossEntry),
    losses: model.losses.map(serializeProfitOrLossEntry),
    income: serializeIncomeExpensesSection(model.income),
    expenses: serializeIncomeExpensesSection(model.expenses),
    valueProfitOrLoss: serializeValueProfitOrLossSection(
      model.valueProfitOrLoss
    ),
    transferProfitOrLoss: serializeTransferProfitOrLossSection(
      model.transferProfitOrLoss
    ),
    profitOrLoss: serializeDecimal(model.profitOrLoss),
    cashFlow: serializeDecimal(model.cashFlow),
  };
}

function serializeProfitOrLossEntry<
  IncomeOrExpense extends "income" | "expense"
>(
  model: ProfitOrLossEntryModel<IncomeOrExpense>
): ProfitOrLossEntry<IncomeOrExpense> {
  return {
    type: model.type,
    categoryId: model.categoryId ? serializeId(model.categoryId) : undefined,
    amount: serializeDecimal(model.amount),
  };
}

export function deserializeMonthPeriod(monthPeriod: MonthPeriod): PeriodModel {
  return {
    _id: deserializeDate(monthPeriod._id),
    type: monthPeriod.type,
    cashFlow: deserializeDecimal(monthPeriod.cashFlow),
    profitOrLoss: deserializeDecimal(monthPeriod.profitOrLoss),
    income: deserializeIncomeExpensesSection(monthPeriod.income),
    expenses: deserializeIncomeExpensesSection(monthPeriod.expenses),
    transferProfitOrLoss: {
      transfers: transformRecord(
        monthPeriod.transferProfitOrLoss.transfers,
        (v) => deserializeDecimal(v)
      ),
      total: deserializeDecimal(monthPeriod.transferProfitOrLoss.total),
    },
    valueProfitOrLoss: {
      accountCategories: transformRecord(
        monthPeriod.valueProfitOrLoss.accountCategories,
        (v) => deserializeDecimal(v)
      ),
      currencies: transformRecord(
        monthPeriod.valueProfitOrLoss.accountCategories,
        (v) => deserializeDecimal(v)
      ),
      stocks: transformRecord(
        monthPeriod.valueProfitOrLoss.accountCategories,
        (v) => deserializeDecimal(v)
      ),
      valuatedAccounts: transformRecord(
        monthPeriod.valueProfitOrLoss.accountCategories,
        (v) => deserializeDecimal(v)
      ),
      accounts: transformRecord(monthPeriod.valueProfitOrLoss.accounts, (v) =>
        deserializeDecimal(v)
      ),
      valueTypes: transformRecord(
        monthPeriod.valueProfitOrLoss.valueTypes,
        (v) => deserializeDecimal(v)
      ),
      valueSubtypes: transformRecord(
        monthPeriod.valueProfitOrLoss.valueSubtypes,
        (v) => deserializeDecimal(v)
      ),
      total: deserializeDecimal(monthPeriod.transferProfitOrLoss.total),
    },
    profits: monthPeriod.profits.map(deserializeProfitOrLossEntry),
    losses: monthPeriod.losses.map(deserializeProfitOrLossEntry),
  };
}

function deserializeProfitOrLossEntry<
  TIncomeOrExpense extends "income" | "expense"
>(
  profitOrLossEntry: ProfitOrLossEntry<TIncomeOrExpense>
): ProfitOrLossEntryModel<TIncomeOrExpense> {
  return {
    amount: deserializeDecimal(profitOrLossEntry.amount),
    type: profitOrLossEntry.type,
    categoryId: profitOrLossEntry.categoryId
      ? deserializeId(profitOrLossEntry.categoryId)
      : undefined,
  };
}

function deserializeIncomeExpensesSection(
  incomeExpensesSection: IncomeExpensesSection
): IncomeExpensesSectionModel {
  return {
    categories: transformRecord(incomeExpensesSection.categories, (s) => ({
      bookings: s.bookings.map<IncomeExpenseRefModel>((b) => ({
        transactionId: deserializeId(b.transactionId),
        date: deserializeDate(b.date),
        amount: deserializeDecimal(b.amount),
        amountInReferenceCurrency: deserializeDecimal(
          b.amountInReferenceCurrency
        ),
        currency: b.currency,
        bookingNote: b.bookingNote,
        transactionNote: b.transactionNote,
      })),
      total: deserializeDecimal(s.total),
    })),
    total: deserializeDecimal(incomeExpensesSection.total),
  };
}
