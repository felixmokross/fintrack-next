import Decimal from "decimal.js-light";
import { uniq } from "lodash";
import { BookingType } from "../../transactions/enums";
import { TransferProfitOrLossSectionModel } from "../model.server";
import {
  ChargeModel,
  DepositModel,
  ExpenseModel,
  IncomeModel,
  TransactionModel,
} from "../../transactions/model.server";
import { referenceCurrency, sum } from "../../util";
import {
  isChargeOrDeposit,
  isIncomeOrExpense,
} from "../../transactions/functions";
import { convertToReferenceCurrencyForUnit } from "../../convert-to-reference-currency-for-unit.server";
import { StockPriceProvider } from "../../stock-prices/functions.server";
import {
  convertToCurrency,
  RateProvider,
} from "../../forex-rates/functions.server";
import { AccountUnitModel } from "../../../accounts/shared/model.server";
import { AccountUnitKind } from "../../../accounts/shared/enums";

export function calculateTransferProfitOrLossSection(
  transactions: readonly TransactionModel[],
  rateProvider: RateProvider,
  stockPriceProvider: StockPriceProvider
): TransferProfitOrLossSectionModel {
  const entries = transactions
    .filter(
      (t) =>
        uniq(
          t.bookings
            .filter(isChargeOrDeposit)
            .map((b) => getAccountUnitKey(b.unit))
        ).length > 1
    )
    .map<[transactionId: string, profitOrLoss: Decimal]>((t) => [
      t._id,
      sum(
        t.bookings
          .filter(isChargeOrDeposit)
          .map((b) =>
            convertToReferenceCurrencyForUnit(
              getChargeDepositValue(b),
              b.unit,
              t.date,
              rateProvider,
              stockPriceProvider
            )
          )
          .concat(
            t.bookings
              .filter(isIncomeOrExpense)
              .map((b) =>
                convertToCurrency(
                  getIncomeExpenseValue(b).negated(),
                  b.currency,
                  referenceCurrency,
                  t.date,
                  rateProvider
                )
              )
          )
      ),
    ]);

  return {
    transfers: Object.fromEntries(entries),
    total: sum(entries.map(([, transferProfitOrLoss]) => transferProfitOrLoss)),
  };
}

function getChargeDepositValue(b: ChargeModel | DepositModel): Decimal {
  switch (b.type) {
    case BookingType.CHARGE:
      return b.amount.negated();
    case BookingType.DEPOSIT:
      return b.amount;
  }
}

function getIncomeExpenseValue(b: IncomeModel | ExpenseModel): Decimal {
  switch (b.type) {
    case BookingType.INCOME:
      return b.amount;
    case BookingType.EXPENSE:
      return b.amount.negated();
  }
}

function getAccountUnitKey(unit: AccountUnitModel): string {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return unit.currency;
    case AccountUnitKind.STOCK:
      return unit.stockId;
  }
}
