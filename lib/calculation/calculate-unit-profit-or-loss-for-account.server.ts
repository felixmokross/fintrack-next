import Decimal from "decimal.js-light";
import { BookingType } from "../enums";
import {
  AccountBalanceModel,
  AccountModel,
  ChargeModel,
  DepositModel,
  TransactionModel,
} from "../model.server";
import { ensure, isChargeOrDeposit, sum } from "../util";
import { convertToReferenceCurrencyForUnit } from "./convert-to-reference-currency-for-unit.server";
import { RateProvider } from "./forex-rates.server";
import { StockPriceProvider } from "./stock-prices.server";

export function calculateUnitProfitOrLossForAccount(
  account: AccountModel,
  transactions: readonly TransactionModel[],
  periodStartBalance: AccountBalanceModel | undefined,
  periodEndBalance: AccountBalanceModel | undefined,
  rateProvider: RateProvider,
  stockPriceProvider: StockPriceProvider
): Decimal {
  const transferSum = sum(
    transactions.map((t) =>
      convertToReferenceCurrencyForUnit(
        getChargeDepositValue(
          ensure(
            t.bookings
              .filter(isChargeOrDeposit)
              .find((b) => b.accountId === account._id)
          )
        ),
        account.unit,
        t.date,
        rateProvider,
        stockPriceProvider
      )
    )
  );
  return getBalanceValue(periodEndBalance)
    .minus(getBalanceValue(periodStartBalance))
    .minus(transferSum);

  function getBalanceValue(
    accountBalance: AccountBalanceModel | undefined
  ): Decimal {
    return accountBalance?.balanceInReferenceCurrency || new Decimal(0);
  }
}

function getChargeDepositValue(b: ChargeModel | DepositModel): Decimal {
  switch (b.type) {
    case BookingType.CHARGE:
      return b.amount.negated();
    case BookingType.DEPOSIT:
      return b.amount;
  }
}
