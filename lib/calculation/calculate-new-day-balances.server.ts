import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { groupBy } from "lodash";
import {
  AccountModel,
  DayBalancesModel,
  DayLedgerModel,
} from "../model.server";
import { byKey, transformRecord } from "../util";
import { convertToReferenceCurrencyForUnit } from "./convert-to-reference-currency-for-unit.server";
import { RateProvider } from "./forex-rates.server";
import { StockPriceProvider } from "./stock-prices.server";

export function calculateNewDayBalances(
  baseDayBalances: DayBalancesModel,
  newDayLedgers: readonly DayLedgerModel[],
  accounts: readonly AccountModel[],
  endDate: Dayjs,
  rateProvider: RateProvider,
  stockPriceProvider: StockPriceProvider
): DayBalancesModel[] {
  const newDayLedgersByDate = groupBy(newDayLedgers, (dl) =>
    dl._id.date.valueOf()
  );
  const newDayLedgersByDateAndAccountId = transformRecord(
    newDayLedgersByDate,
    (dls) => byKey(dls, (dl) => dl._id.accountId)
  );

  const days = endDate.diff(baseDayBalances._id, "day");
  const dayBalances = new Array<DayBalancesModel>(days);
  let workDate = baseDayBalances._id.add(1, "day");
  let previousBalancesByAccount = baseDayBalances.byAccount;

  for (let i = 0; i < days; i++) {
    dayBalances[i] = {
      _id: workDate,
      byAccount: Object.fromEntries(
        accounts
          // TODO could be optimized
          .filter((a) => isOpenAccount(a, workDate))
          .map<[AccountModel, Decimal]>((a) => {
            const dayLedgersByAccountId =
              newDayLedgersByDateAndAccountId[workDate.valueOf()];
            const dayLedger =
              dayLedgersByAccountId && dayLedgersByAccountId[a._id];
            if (dayLedger) {
              return [a, dayLedger.balance];
            }

            if (previousBalancesByAccount[a._id]) {
              return [
                a,
                previousBalancesByAccount[a._id].balanceInAccountCurrency,
              ];
            }

            return [a, new Decimal(0)];
          })
          .map(([account, balance]) => [
            account._id,
            {
              balanceInAccountCurrency: balance,
              balanceInReferenceCurrency: convertToReferenceCurrencyForUnit(
                balance,
                account.unit,
                workDate,
                rateProvider,
                stockPriceProvider
              ),
            },
          ])
      ),
    };

    workDate = workDate.add(1, "day");
    previousBalancesByAccount = dayBalances[i].byAccount;
  }

  return dayBalances;
}

function isOpenAccount(account: AccountModel, date: Dayjs): boolean {
  if (account.openingDate && account.openingDate.isAfter(date)) {
    return false;
  }

  if (account.closingDate && account.closingDate.isBefore(date)) {
    return false;
  }

  return true;
}
