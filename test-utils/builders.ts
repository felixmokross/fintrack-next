import {
  AccountDto,
  CurrencyAccountUnitDto,
  StockAccountUnitDto,
} from "../pages/accounts/shared/dtos";
import { v4 as uuid } from "uuid";
import { AccountType, AccountUnitKind } from "../pages/accounts/shared/enums";
import { AccountCategoryType } from "../pages/shared/account-categories/enums";
import { AccountDetailDto } from "../pages/accounts/[accountId]/dtos";
import { AccountCategoryDto } from "../pages/shared/account-categories/dtos";
import { IncomeCategoryDto } from "../pages/shared/income-categories/dtos";
import { ExpenseCategoryDto } from "../pages/shared/expense-categories/dtos";
import {
  DayLedgerDto,
  DayLedgerLineDto,
} from "../pages/shared/day-ledgers/dtos";
import {
  AppreciationDto,
  ChargeDto,
  DepositDto,
  DepreciationDto,
  ExpenseDto,
  IncomeDto,
  TransactionDto,
} from "../pages/shared/transactions/dtos";
import { BookingType } from "../pages/shared/transactions/enums";
import { StockDto } from "../pages/shared/stocks/dtos";
import { CurrencyDto } from "../pages/shared/currencies/dtos";
import { ValueChangeFormValues } from "../pages/shared/transactions/types";

export function buildAccount(values: Partial<AccountDto> = {}): AccountDto {
  return {
    _id: values._id || uuid(),
    name: values.name || "Default Account Name",
    unit: values.unit || { kind: AccountUnitKind.CURRENCY, currency: "CHF" },
    currentBalance: {
      valueInAccountUnit: values.currentBalance?.valueInAccountUnit || "200",
      valueInReferenceCurrency:
        values.currentBalance?.valueInReferenceCurrency || "200",
    },
    isActive: values.isActive !== undefined ? values.isActive : true,
    type: values.type || AccountType.TRACKED,
    groupId: values.groupId || null,
    valueTypeId: values.valueTypeId || null,
    valueSubtypeId: values.valueSubtypeId || null,
    categoryId: values.categoryId || uuid(),
    categoryType: values.categoryType || AccountCategoryType.ASSET,
    closingDate: values.closingDate || null,
  };
}

export function buildAccountDetail(
  values: Partial<AccountDetailDto> = {}
): AccountDetailDto {
  return {
    _id: values._id || uuid(),
    name: values.name || "Default Account Name",
    unit: values.unit || { kind: AccountUnitKind.CURRENCY, currency: "CHF" },
    isActive: values.isActive !== undefined ? values.isActive : true,
    type: values.type || AccountType.TRACKED,
    categoryId: values.categoryId || uuid(),
    categoryType: values.categoryType || AccountCategoryType.ASSET,
    groupId: values.groupId || null,
    openingBalance: values.openingBalance || null,
    openingDate: values.openingDate || null,
    closingDate: values.closingDate || null,
  };
}

export function buildCurrencyAccountUnit(
  currency?: string
): CurrencyAccountUnitDto {
  return { kind: AccountUnitKind.CURRENCY, currency: currency || "EUR" };
}

export function buildStockAccountUnit(stockId?: string): StockAccountUnitDto {
  return { kind: AccountUnitKind.STOCK, stockId: stockId || uuid() };
}

export function buildAccountCategory(
  values: Partial<AccountCategoryDto> = {}
): AccountCategoryDto {
  return {
    _id: values._id || uuid(),
    name: values.name || "Default Account Category Name",
    type: values.type || AccountCategoryType.ASSET,
    order: values.order || 1,
    currentBalance: values.currentBalance || "100",
  };
}

export function buildIncomeCategory(
  values: Partial<IncomeCategoryDto> = {}
): IncomeCategoryDto {
  return {
    _id: values._id || uuid(),
    name: values.name || "Main Salary",
  };
}

export function buildExpenseCategory(
  values: Partial<ExpenseCategoryDto> = {}
): ExpenseCategoryDto {
  return {
    _id: values._id || uuid(),
    name: values.name || "Groceries",
  };
}

export function buildDayLedger(
  values: Partial<DayLedgerDto> = {}
): DayLedgerDto {
  return {
    _id: values._id || { accountId: uuid(), date: "2019-03-12" },
    lines: values.lines || [buildDayLedgerLine()],
    balance: values.balance || "2012.3",
  };
}

export function buildDayLedgerLine(
  values: Partial<DayLedgerLineDto> = {}
): DayLedgerLineDto {
  return {
    transactionId: values.transactionId || uuid(),
    note: values.note,
    bookings: values.bookings || [
      buildCharge({ amount: "240.1", unit: buildCurrencyAccountUnit("EUR") }),
      buildExpense({ amount: "240.1", currency: "EUR" }),
    ],
    value: values.value || "-240.1",
  };
}

export function buildCharge(values: Partial<ChargeDto> = {}): ChargeDto {
  return {
    type: BookingType.CHARGE,
    accountId: values.accountId || uuid(),
    note: values.note || null,
    amount: values.amount || "120.5",
    unit: buildCurrencyAccountUnit("EUR"),
  };
}

export function buildDeposit(values: Partial<DepositDto> = {}): DepositDto {
  return {
    type: BookingType.DEPOSIT,
    accountId: values.accountId || uuid(),
    note: values.note || null,
    amount: values.amount || "120.5",
    unit: buildCurrencyAccountUnit("EUR"),
  };
}

export function buildExpense(values: Partial<ExpenseDto> = {}): ExpenseDto {
  return {
    type: BookingType.EXPENSE,
    expenseCategoryId: values.expenseCategoryId || uuid(),
    note: values.note || null,
    amount: values.amount || "73.2",
    currency: values.currency || "EUR",
  };
}

export function buildIncome(values: Partial<IncomeDto> = {}): IncomeDto {
  return {
    type: BookingType.INCOME,
    incomeCategoryId: values.incomeCategoryId || uuid(),
    note: values.note || null,
    amount: values.amount || "4030.80",
    currency: values.currency || "EUR",
  };
}

export function buildAppreciation(
  values: Partial<AppreciationDto> = {}
): AppreciationDto {
  return {
    type: BookingType.APPRECIATION,
    amount: values.amount || "300.2",
  };
}

export function buildDepreciation(
  values: Partial<DepreciationDto> = {}
): DepreciationDto {
  return {
    type: BookingType.DEPRECIATION,
    amount: values.amount || "300.2",
  };
}

export function buildStock(values: Partial<StockDto>): StockDto {
  return {
    _id: values._id || uuid(),
    symbol: values.symbol || "MYSTK",
    tradingCurrency: values.tradingCurrency || "EUR",
  };
}

// export function buildTransactionFormValues(
//   values: Partial<TransactionFormValues> = {}
// ): TransactionFormValues {
//   return {
//     date: values.date !== undefined ? values.date : "12 Dec 2020",
//     note: values.note || "",
//     bookings: values.bookings || [
//       buildChargeDepositFormValues({ type: BookingType.CHARGE }),
//       buildExpenseFormValues(),
//     ],
//   };
// }

// export function buildChargeDepositFormValues(
//   values: Partial<ChargeDepositFormValues> = {}
// ): ChargeDepositFormValues {
//   return {
//     type: values.type || BookingType.CHARGE,
//     note: values.note || "",
//     accountId:
//       values.accountId !== undefined ? values.accountId : "default-account",
//     amount: values.amount !== undefined ? values.amount : "140.1",
//   };
// }

// export function buildExpenseFormValues(
//   values: Partial<ExpenseFormValues> = {}
// ): ExpenseFormValues {
//   return {
//     type: BookingType.EXPENSE,
//     note: values.note || "",
//     expenseCategoryId:
//       values.expenseCategoryId !== undefined
//         ? values.expenseCategoryId
//         : "default-expense-category",
//     currency: values.currency !== undefined ? values.currency : "CHF",
//     amount: values.amount !== undefined ? values.amount : "140.1",
//   };
// }

// export function buildIncomeFormValues(
//   values: Partial<IncomeFormValues> = {}
// ): IncomeFormValues {
//   return {
//     type: BookingType.INCOME,
//     note: values.note || "",
//     incomeCategoryId:
//       values.incomeCategoryId !== undefined
//         ? values.incomeCategoryId
//         : "default-income-category",
//     currency: values.currency !== undefined ? values.currency : "CHF",
//     amount: values.amount !== undefined ? values.amount : "140.1",
//   };
// }

export function buildTransaction(
  values: Partial<TransactionDto> = {}
): TransactionDto {
  return {
    _id: values._id || uuid(),
    date: values.date || "2020-12-07",
    note: values.note || null,
    bookings: values.bookings || [
      buildCharge({ amount: "100" }),
      buildExpense({ amount: "100" }),
    ],
  };
}

export function buildCurrency(values: Partial<CurrencyDto> = {}): CurrencyDto {
  return {
    _id: values._id || uuid(),
    name: values.name || "Default Currency",
    decimals: values.decimals,
  };
}

// export function buildNewAccountFormValues(
//   values: Partial<NewAccountFormValues> = {}
// ): NewAccountFormValues {
//   return {
//     name: values.name !== undefined ? values.name : "My New Account",
//     currency: values.currency !== undefined ? values.currency : "USD",
//     categoryId:
//       values.categoryId !== undefined ? values.categoryId : "my-category",
//     openingDate:
//       values.openingDate !== undefined ? values.openingDate : "2020-11-08",
//   };
// }

export function buildValueChangeFormValues(
  values: Partial<ValueChangeFormValues> = {}
): ValueChangeFormValues {
  return {
    date: values.date !== undefined ? values.date : "13 Nov 2020",
    note: values.note || "",
    valueChange:
      values.valueChange !== undefined ? values.valueChange : "128.3",
  };
}

// export function buildMonthBalances(
//   values: Partial<MonthBalancesDto> = {}
// ): MonthBalancesDto {
//   return {
//     _id: values._id || "2020-11-01",
//     accountCategories: values.accountCategories || {},
//     netWorth: values.netWorth || "20000",
//   };
// }

// export function buildPeriod(values: Partial<PeriodDto> = {}): PeriodDto {
//   return {
//     _id: values._id || "2020-11-01",
//     type: values.type || PeriodType.MONTH,
//     profits: values.profits || [],
//     losses: values.losses || [],
//     income: values.income || {
//       categories: { "my-income-category": { total: "300", bookings: [] } },
//       total: "300",
//     },
//     expenses: values.expenses || {
//       categories: { "my-expense-category": { total: "200", bookings: [] } },
//       total: "200",
//     },
//     valueProfitOrLoss: values.valueProfitOrLoss || {
//       stocks: { "stock-1": "30000" },
//       currencies: { EUR: "-3000" },
//       valuatedAccounts: {},
//       accountCategories: {},
//       accounts: {},
//       valueTypes: {},
//       valueSubtypes: {},
//       total: "27000",
//     },
//     transferProfitOrLoss: values.transferProfitOrLoss || {
//       total: "0",
//       transfers: {},
//     },
//     profitOrLoss: values.profitOrLoss || "2000",
//     cashFlow: values.cashFlow || "4000",
//   };
// }

// export function buildValueType(values: Partial<ValueTypeDto>) {
//   return {
//     ...values,
//   };
// }
