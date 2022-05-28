import { Dayjs } from "dayjs";
import { flatten, groupBy } from "lodash";
import { PeriodType } from "../enums";
import {
  IncomeExpenseRefModel,
  IncomeExpensesSectionModel,
  PeriodModel,
} from "../model.server";
import { sum, transformRecord } from "../../util";
import {
  calculateLossEntries,
  calculateProfitEntries,
} from "./calculate-profit-or-loss-entries.server";

export default function sumPeriods(
  id: Dayjs,
  sumPeriodType: PeriodType,
  periods: readonly PeriodModel[]
): PeriodModel {
  const income = sumIncomeExpensesSection(periods, (p) => p.income);
  const expenses = sumIncomeExpensesSection(periods, (p) => p.expenses);

  const valueProfitOrLoss = {
    accountCategories: sumSection(
      periods,
      (p) => p.valueProfitOrLoss.accountCategories,
      (values) => sum(values.map((value) => value))
    ),
    currencies: sumSection(
      periods,
      (p) => p.valueProfitOrLoss.currencies,
      (values) => sum(values.map((value) => value))
    ),
    valuatedAccounts: sumSection(
      periods,
      (p) => p.valueProfitOrLoss.valuatedAccounts,
      (values) => sum(values.map((value) => value))
    ),
    accounts: sumSection(
      periods,
      (p) => p.valueProfitOrLoss.accounts,
      (values) => sum(values.map((value) => value))
    ),
    valueTypes: sumSection(
      periods,
      (p) => p.valueProfitOrLoss.valueTypes,
      (values) => sum(values.map((value) => value))
    ),
    valueSubtypes: sumSection(
      periods,
      (p) => p.valueProfitOrLoss.valueSubtypes,
      (values) => sum(values.map((value) => value))
    ),
    stocks: sumSection(
      periods,
      (p) => p.valueProfitOrLoss.stocks,
      (values) => sum(values.map((value) => value))
    ),
    total: sum(periods.map((p) => p.valueProfitOrLoss.total)),
  };

  const transferProfitOrLoss = {
    transfers: Object.assign(
      {},
      ...periods.map((p) => p.transferProfitOrLoss.transfers)
    ),
    total: sum(periods.map((p) => p.transferProfitOrLoss.total)),
  };

  return {
    _id: id,
    type: sumPeriodType,
    profits: calculateProfitEntries(
      income,
      valueProfitOrLoss,
      transferProfitOrLoss
    ),
    losses: calculateLossEntries(
      expenses,
      valueProfitOrLoss,
      transferProfitOrLoss
    ),
    income,
    expenses,
    valueProfitOrLoss,
    transferProfitOrLoss,
    cashFlow: sum(periods.map((p) => p.cashFlow)),
    profitOrLoss: sum(periods.map((p) => p.profitOrLoss)),
  };
}

function sumSection<TEntry>(
  periods: readonly PeriodModel[],
  sectionSelector: (p: PeriodModel) => Record<string, TEntry>,
  sumEntries: (entries: TEntry[]) => TEntry
): Record<string, TEntry> {
  return transformRecord(
    groupBy(
      flatten(periods.map((p) => Object.entries(sectionSelector(p)))),
      ([key]) => key
    ),
    (entriesWithKey) => sumEntries(entriesWithKey.map(([, entry]) => entry))
  );
}

function sumIncomeExpensesSection(
  periods: readonly PeriodModel[],
  sectionSelector: (p: PeriodModel) => IncomeExpensesSectionModel
): IncomeExpensesSectionModel {
  return {
    categories: sumSection(
      periods,
      (p) => sectionSelector(p).categories,
      (categoryEntries) => ({
        bookings: flatten(
          categoryEntries.map((categoryEntry) => categoryEntry.bookings)
        ) as readonly IncomeExpenseRefModel[],
        total: sum(categoryEntries.map((categoryEntry) => categoryEntry.total)),
      })
    ),
    total: sum(periods.map((p) => sectionSelector(p).total)),
  };
}
