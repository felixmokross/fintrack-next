import dayjs from "dayjs";
import Decimal from "decimal.js-light";
import { FormikErrors } from "formik";
import { AccountDto } from "../../accounts/shared/dtos";
import { AccountUnitKind } from "../../accounts/shared/enums";
import { dateFormat, formatUnitValue, RoundingMode, sum } from "../util";
import { BookingType } from "./enums";
import { getCurrencies, isChargeOrDeposit } from "./functions";
import {
  BookingFormValues,
  ChargeDepositFormValues,
  ExpenseFormValues,
  IncomeFormValues,
  TransactionFormValues,
} from "./types";

export function validate(
  values: TransactionFormValues,
  accounts: Record<string, AccountDto>
): FormikErrors<TransactionFormValues> {
  const errors: FormikErrors<TransactionFormValues> = {};

  if (!values.date) errors.date = "Required";
  else if (!dayjs.utc(values.date, dateFormat).isValid())
    errors.date = "Must be a valid date";

  if (allAccountsProvided() && !hasAtLeastOneCurrencyAccount()) {
    errors.formError = "Must have at least one currency account";
  } else if (allAccountsProvided() && allAmountsAreValid()) {
    const currencies = getCurrencies(values, accounts);

    if (currencies.length === 1 && !hasStockBookings()) {
      const transactionBalance = getTransactionBalance();

      if (!transactionBalance.isZero()) {
        errors.formError = `Transaction is not balanced by ${
          currencies[0]
        } ${formatUnitValue(
          transactionBalance.toNumber(),
          RoundingMode.NORMAL,
          false,
          true
        )}`;
      }
    }
  }

  errors.bookings = values.bookings.map(validateBooking);
  if (errors.bookings.every((b) => !b || Object.values(b).length === 0))
    delete errors.bookings;

  return errors;

  function validateBooking(
    values: BookingFormValues
  ): FormikErrors<BookingFormValues> {
    const errors: FormikErrors<BookingFormValues> = {};

    if (!values.amount) errors.amount = "Required";
    else if (!isValidDecimal(values.amount))
      errors.amount = "Must be a valid amount";
    else if (new Decimal(values.amount).isNegative())
      errors.amount = "Must be positive";
    else if (new Decimal(values.amount).isZero())
      errors.amount = "Must not be zero";

    switch (values.type) {
      case BookingType.CHARGE:
      case BookingType.DEPOSIT:
        return { ...errors, ...validateChargeDeposit(values) };

      case BookingType.EXPENSE:
        return { ...errors, ...validateExpense(values) };

      case BookingType.INCOME:
        return { ...errors, ...validateIncome(values) };

      default:
        throw new Error("Unsupported booking type");
    }
  }

  function validateChargeDeposit(
    values: ChargeDepositFormValues
  ): FormikErrors<ChargeDepositFormValues> {
    const errors: FormikErrors<ChargeDepositFormValues> = {};

    if (!values.accountId) {
      errors.accountId = "Required";
    }

    return errors;
  }

  function validateExpense(
    values: ExpenseFormValues
  ): FormikErrors<ExpenseFormValues> {
    const errors: FormikErrors<ExpenseFormValues> = {};

    if (!values.expenseCategoryId) {
      errors.expenseCategoryId = "Required";
    }

    if (areCurrenciesAvailable() && !values.currency) {
      errors.currency = "Required";
    }

    return errors;
  }

  function validateIncome(
    values: IncomeFormValues
  ): FormikErrors<IncomeFormValues> {
    const errors: FormikErrors<IncomeFormValues> = {};

    if (!values.incomeCategoryId) {
      errors.incomeCategoryId = "Required";
    }

    if (areCurrenciesAvailable() && !values.currency) {
      errors.currency = "Required";
    }

    return errors;
  }

  function hasAtLeastOneCurrencyAccount(): boolean {
    return getChargeAndDepositAccounts().some(
      (a) => a.unit.kind === AccountUnitKind.CURRENCY
    );

    function getChargeAndDepositAccounts(): readonly AccountDto[] {
      return values.bookings
        .filter(isChargeOrDeposit)
        .map((b) => b.accountId)
        .map(getAccount);
    }
  }

  function allAccountsProvided(): boolean {
    return values.bookings.filter(isChargeOrDeposit).every((b) => b.accountId);
  }

  function allAmountsAreValid(): boolean {
    const amounts = values.bookings.map((b) => b.amount);
    return (
      amounts.every((a) => a) &&
      amounts.every(isValidDecimal) &&
      amounts.every((a) => new Decimal(a).isPositive())
    );
  }

  function getTransactionBalance(): Decimal {
    return sum(
      values.bookings
        .filter(
          (b) => b.type === BookingType.CHARGE || b.type === BookingType.INCOME
        )
        .map((b) => b.amount)
    ).sub(
      sum(
        values.bookings
          .filter(
            (b) =>
              b.type === BookingType.DEPOSIT || b.type === BookingType.EXPENSE
          )
          .map((b) => b.amount)
      )
    );
  }

  function getAccount(accountId: string): AccountDto {
    const account = accounts[accountId];
    if (!account) throw new Error(`Account ${accountId} does not exist!`);

    return account;
  }

  function areCurrenciesAvailable(): boolean {
    return getCurrencies(values, accounts).length > 0;
  }

  function hasStockBookings(): boolean {
    return values.bookings
      .filter(isChargeOrDeposit)
      .map((b) => getAccount(b.accountId).unit.kind)
      .some((k) => k === AccountUnitKind.STOCK);
  }
}

function isValidDecimal(value: string): boolean {
  try {
    new Decimal(value);
    return true;
  } catch (e) {
    return false;
  }
}
