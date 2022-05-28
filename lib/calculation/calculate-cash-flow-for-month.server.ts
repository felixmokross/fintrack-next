import { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { MonthBalancesModel } from "../../pages/shared/balances/model.server";

export function calculateCashFlowForMonth(
  month: Dayjs,
  monthBalancesByMonth: Record<number, MonthBalancesModel>,
  cashCategoryId: string
): Decimal {
  return getCashBalance(monthBalancesByMonth[month.valueOf()]).minus(
    getCashBalance(monthBalancesByMonth[month.subtract(1, "month").valueOf()])
  );

  function getCashBalance(monthBalances: MonthBalancesModel): Decimal {
    return new Decimal(
      monthBalances.accountCategories[cashCategoryId]?.toString() || 0
    );
  }
}
