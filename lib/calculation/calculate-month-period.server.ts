import { Dayjs } from "dayjs";
import { PeriodType } from "../../pages/shared/periods/enums";
import { BookingType } from "../../pages/shared/transactions/enums";
import { PeriodModel } from "../../pages/shared/periods/model.server";
import {
  DayBalancesModel,
  MonthBalancesModel,
} from "../../pages/shared/balances/model.server";
import { TransactionModel } from "../../pages/shared/transactions/model.server";
import { AccountModel } from "../../pages/shared/accounts/model.server";
import { sum } from "../../pages/shared/util";
import { calculateCashFlowForMonth } from "./calculate-cash-flow-for-month.server";
import { calculateIncomeExpensesSection } from "./calculate-income-expenses-section.server";
import {
  calculateLossEntries,
  calculateProfitEntries,
} from "./calculate-profit-or-loss-entries.server";
import { calculateTransferProfitOrLossSection } from "./calculate-transfer-profit-or-loss-section.server";
import { calculateValueProfitOrLossSection } from "./calculate-value-profit-or-loss-section.server";
import { RateProvider } from "./forex-rates.server";
import { StockPriceProvider } from "./stock-prices.server";
import { getTransactionsByAccountId } from "./transactions-by-account.server";

export function calculateMonthPeriod(
  month: Dayjs,
  transactions: readonly TransactionModel[],
  accounts: readonly AccountModel[],
  periodStartBalances: DayBalancesModel,
  periodEndBalances: DayBalancesModel,
  rateProvider: RateProvider,
  stockPriceProvider: StockPriceProvider,
  cashCategoryId: string,
  monthBalancesByMonth: Record<number, MonthBalancesModel>
): PeriodModel {
  const transactionsByAccountId = getTransactionsByAccountId(transactions);

  const incomeSection = calculateIncomeExpensesSection(
    transactions,
    BookingType.INCOME,
    (b) => b.incomeCategoryId,
    rateProvider
  );

  const expenseSection = calculateIncomeExpensesSection(
    transactions,
    BookingType.EXPENSE,
    (b) => b.expenseCategoryId,
    rateProvider
  );

  const transferProfitOrLossSection = calculateTransferProfitOrLossSection(
    transactions,
    rateProvider,
    stockPriceProvider
  );

  const valueProfitOrLossSection = calculateValueProfitOrLossSection(
    transactionsByAccountId,
    accounts,
    periodStartBalances,
    periodEndBalances,
    rateProvider,
    stockPriceProvider
  );

  return {
    _id: month,
    type: PeriodType.MONTH,
    profits: calculateProfitEntries(
      incomeSection,
      valueProfitOrLossSection,
      transferProfitOrLossSection
    ),
    losses: calculateLossEntries(
      expenseSection,
      valueProfitOrLossSection,
      transferProfitOrLossSection
    ),
    income: incomeSection,
    expenses: expenseSection,
    valueProfitOrLoss: valueProfitOrLossSection,
    transferProfitOrLoss: transferProfitOrLossSection,
    profitOrLoss: sum([
      incomeSection.total,
      expenseSection.total.negated(),
      valueProfitOrLossSection.total,
      transferProfitOrLossSection.total,
    ]),
    cashFlow: calculateCashFlowForMonth(
      month,
      monthBalancesByMonth,
      cashCategoryId
    ),
  };
}
