import Decimal from "decimal.js-light";
import { groupBy } from "lodash";
import { AccountType, AccountUnitKind } from "../../accounts/enums";
import { ValueProfitOrLossSectionModel } from "../model.server";
import { DayBalancesModel } from "../../balances/model.server";
import { TransactionModel } from "../../transactions/model.server";
import {
  AccountModel,
  CurrencyAccountModel,
  StockAccountModel,
  TrackedAccountModel,
  ValuatedAccountModel,
} from "../../accounts/model.server";
import { referenceCurrency, sum, transformRecord } from "../../util";
import { calculateUnitProfitOrLossForAccount } from "./calculate-unit-profit-or-loss-for-account.server";
import calculateValueChangeProfitOrLossForAccount from "./calculate-value-change-profit-or-loss-for-account.server";
import { RateProvider } from "../../forex-rates/functions.server";
import { StockPriceProvider } from "../../stock-prices/functions.server";

export function calculateValueProfitOrLossSection(
  transactionsByAccountId: Record<string, readonly TransactionModel[]>,
  accounts: readonly AccountModel[],
  periodStartBalances: DayBalancesModel,
  periodEndBalances: DayBalancesModel,
  rateProvider: RateProvider,
  stockPriceProvider: StockPriceProvider
): ValueProfitOrLossSectionModel {
  const accountsByType = groupBy(accounts, (a) => a.type);
  const trackedAccounts = (accountsByType[AccountType.TRACKED] ||
    []) as TrackedAccountModel[];
  const valuatedAccounts = (accountsByType[AccountType.VALUATED] ||
    []) as ValuatedAccountModel[];

  const trackedAccountsByUnitKind = groupBy(
    trackedAccounts,
    (a) => a.unit.kind
  );
  const trackedStockAccounts = (trackedAccountsByUnitKind[
    AccountUnitKind.STOCK
  ] || []) as StockAccountModel[];
  const trackedForexAccounts = (
    (trackedAccountsByUnitKind[AccountUnitKind.CURRENCY] ||
      []) as (CurrencyAccountModel & TrackedAccountModel)[]
  ).filter((a) => a.unit.currency !== referenceCurrency);

  const trackedStockAccountsWithProfitOrLoss =
    getTrackedStockAccountsWithProfitOrLoss();
  const trackedForexAccountsWithProfitOrLoss =
    getTrackedForexAccountsWithProfitOrLoss();
  const valuatedAccountsWithProfitOrLoss =
    getValuatedAccountsWithProfitOrLoss();

  const accountsWithProfitOrLoss: readonly [AccountModel, Decimal][] = [
    ...trackedStockAccountsWithProfitOrLoss,
    ...trackedForexAccountsWithProfitOrLoss,
    ...valuatedAccountsWithProfitOrLoss,
  ];

  return {
    stocks: transformRecord(
      groupBy(trackedStockAccountsWithProfitOrLoss, ([a]) => a.unit.stockId),
      (entries) => sum(entries.map(([, profitOrLoss]) => profitOrLoss))
    ),
    currencies: transformRecord(
      groupBy(trackedForexAccountsWithProfitOrLoss, ([a]) => a.unit.currency),
      (entries) => sum(entries.map(([, profitOrLoss]) => profitOrLoss))
    ),
    valuatedAccounts: transformRecord(
      groupBy(valuatedAccountsWithProfitOrLoss, ([a]) => a._id),
      (entries) => sum(entries.map(([, profitOrLoss]) => profitOrLoss))
    ),
    accountCategories: transformRecord(
      groupBy(accountsWithProfitOrLoss, ([a]) => a.categoryId),
      (entries) => sum(entries.map(([, profitOrLoss]) => profitOrLoss))
    ),
    accounts: Object.fromEntries(
      accountsWithProfitOrLoss.map(([a, profitOrLoss]) => [a._id, profitOrLoss])
    ),
    valueTypes: transformRecord(
      groupBy(accountsWithProfitOrLoss, ([a]) => a.valueTypeId),
      (entries) => sum(entries.map(([, profitOrLoss]) => profitOrLoss))
    ),
    valueSubtypes: transformRecord(
      groupBy(accountsWithProfitOrLoss, ([a]) => a.valueSubtypeId),
      (entries) => sum(entries.map(([, profitOrLoss]) => profitOrLoss))
    ),
    total: sum(
      accountsWithProfitOrLoss.map(([, profitOrLoss]) => profitOrLoss)
    ),
  };

  function getTrackedAccountValueProfitOrLoss(
    account: TrackedAccountModel
  ): Decimal {
    return calculateUnitProfitOrLossForAccount(
      account,
      transactionsByAccountId[account._id] || [],
      periodStartBalances.byAccount[account._id],
      periodEndBalances.byAccount[account._id],
      rateProvider,
      stockPriceProvider
    );
  }

  function getValuatedAccountValueProfitOrLoss(
    account: ValuatedAccountModel
  ): Decimal {
    return calculateValueChangeProfitOrLossForAccount(
      account,
      transactionsByAccountId[account._id] || [],
      rateProvider
    );
  }

  function getTrackedStockAccountsWithProfitOrLoss() {
    return trackedStockAccounts.map<[StockAccountModel, Decimal]>((a) => [
      a,
      getTrackedAccountValueProfitOrLoss(a),
    ]);
  }

  function getTrackedForexAccountsWithProfitOrLoss() {
    return trackedForexAccounts.map<
      [CurrencyAccountModel & TrackedAccountModel, Decimal]
    >((a) => [a, getTrackedAccountValueProfitOrLoss(a)]);
  }

  function getValuatedAccountsWithProfitOrLoss() {
    return valuatedAccounts.map<[ValuatedAccountModel, Decimal]>((a) => [
      a,
      getValuatedAccountValueProfitOrLoss(a),
    ]);
  }
}
