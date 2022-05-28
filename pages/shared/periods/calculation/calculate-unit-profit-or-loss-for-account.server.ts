import Decimal from "decimal.js-light";
import { BookingType } from "../../transactions/enums";
import { AccountBalanceModel } from "../../balances/model.server";
import {
  ChargeModel,
  DepositModel,
  TransactionModel,
} from "../../transactions/model.server";
import { AccountModel } from "../../accounts/model.server";
import { ensure, sum } from "../../util";
import { isChargeOrDeposit } from "../../transactions/functions";
import { convertToReferenceCurrencyForUnit } from "../../convert-to-reference-currency-for-unit.server";
import { RateProvider } from "../../forex-rates/functions.server";
import { StockPriceProvider } from "../../stock-prices/functions.server";

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
