import Decimal from "decimal.js-light";
import { groupBy, orderBy, sortBy } from "lodash";
import {
  AccountModel,
  DayBalancesModel,
  MonthBalancesModel,
} from "../model.server";
import { sum } from "../util";

export function calculateNewMonthBalances(
  newDayBalances: readonly DayBalancesModel[],
  accounts: readonly AccountModel[]
): MonthBalancesModel[] {
  const dayBalancesByMonth = groupBy(newDayBalances, (db) =>
    db._id.startOf("month").valueOf()
  );
  const categoryIdByAccountId = Object.fromEntries(
    accounts.map((a) => [a._id, a.categoryId])
  );

  return sortBy(Object.entries(dayBalancesByMonth), ([d]) => d).map(
    ([, dbs]) => {
      const lastDayBalances = orderBy(dbs, (db) => db._id.valueOf(), "desc")[0];
      const accountBalances = Object.entries(lastDayBalances.byAccount);
      const categoryBalances = accountBalances.map<[string, Decimal]>(
        ([accountId, { balanceInReferenceCurrency }]) => [
          categoryIdByAccountId[accountId],
          balanceInReferenceCurrency,
        ]
      );

      const accountCategories = categoryBalances.reduce<{
        [categoryId: string]: Decimal;
      }>((acc, [categoryId, balance]) => {
        acc[categoryId] = (acc[categoryId] || new Decimal(0)).plus(balance);
        return acc;
      }, {});

      return {
        _id: lastDayBalances._id.startOf("month"),
        accountCategories,
        netWorth: sum(
          Object.entries(accountCategories).map(([, balance]) => balance)
        ),
      };
    }
  );
}
