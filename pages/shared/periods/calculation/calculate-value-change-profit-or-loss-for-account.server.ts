import Decimal from "decimal.js-light";
import { flatten } from "lodash";
import { BookingType } from "../../transactions/enums";
import { AccountUnitKind } from "../../accounts/enums";
import {
  AppreciationModel,
  DepreciationModel,
  TransactionModel,
} from "../../transactions/model.server";
import { AccountModel } from "../../accounts/model.server";
import { referenceCurrency, sum } from "../../util";
import { isAppreciationOrDepreciation } from "../../transactions/functions";
import {
  convertToCurrency,
  RateProvider,
} from "../../forex-rates/functions.server";

// TODO do we need this function? Doesn't calculateUNitProfitOrLossForAccount work equally?
export default function calculateValueChangeProfitOrLossForAccount(
  account: AccountModel,
  transactions: readonly TransactionModel[],
  rateProvider: RateProvider
): Decimal {
  return sum(
    flatten(
      transactions.map((t) =>
        t.bookings
          .filter(isAppreciationOrDepreciation)
          .map((b) =>
            convertToCurrency(
              getValueChange(b),
              getCurrencyFromAccount(account),
              referenceCurrency,
              t.date,
              rateProvider
            )
          )
      )
    )
  );
}

function getValueChange(
  booking: AppreciationModel | DepreciationModel
): Decimal {
  switch (booking.type) {
    case BookingType.APPRECIATION:
      return booking.amount;
    case BookingType.DEPRECIATION:
      return booking.amount.negated();
  }
}

function getCurrencyFromAccount({ unit }: AccountModel): string {
  if (unit.kind !== AccountUnitKind.CURRENCY)
    throw new Error(
      "Only currency accounts support appreciation and depreciation transactions"
    );

  return unit.currency;
}
