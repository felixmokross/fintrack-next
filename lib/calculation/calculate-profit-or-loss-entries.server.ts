import {
  IncomeExpensesSectionModel,
  ProfitOrLossEntryModel,
  TransferProfitOrLossSectionModel,
  ValueProfitOrLossSectionModel,
} from "../../pages/shared/periods/model.server";

export function calculateProfitEntries(
  incomeExpensesSection: IncomeExpensesSectionModel,
  valueProfitOrLossSection: ValueProfitOrLossSectionModel,
  transferProfitOrLossSection: TransferProfitOrLossSectionModel
): readonly ProfitOrLossEntryModel<"income">[] {
  return fromIncomeExpensesSection(incomeExpensesSection, "income")
    .concat(
      Object.entries(valueProfitOrLossSection.valueTypes)
        .filter(([, amount]) => amount.greaterThan(0))
        .map<ProfitOrLossEntryModel<"income">>(([categoryId, amount]) => ({
          type: "value",
          categoryId,
          amount,
        }))
    )
    .concat(
      transferProfitOrLossSection.total.isPositive()
        ? [{ type: "transfers", amount: transferProfitOrLossSection.total }]
        : []
    );
}

export function calculateLossEntries(
  incomeExpensesSection: IncomeExpensesSectionModel,
  valueProfitOrLossSection: ValueProfitOrLossSectionModel,
  transferProfitOrLossSection: TransferProfitOrLossSectionModel
): readonly ProfitOrLossEntryModel<"expense">[] {
  return fromIncomeExpensesSection(incomeExpensesSection, "expense")
    .concat(
      Object.entries(valueProfitOrLossSection.valueTypes)
        .filter(([, amount]) => amount.lessThan(0))
        .map<ProfitOrLossEntryModel<"expense">>(([categoryId, amount]) => ({
          type: "value",
          categoryId,
          amount: amount.absoluteValue(),
        }))
    )
    .concat(
      transferProfitOrLossSection.total.isNegative()
        ? [
            {
              type: "transfers",
              amount: transferProfitOrLossSection.total.absoluteValue(),
            },
          ]
        : []
    );
}

function fromIncomeExpensesSection<
  TIncomeOrExpense extends "income" | "expense"
>(
  incomeExpensesSection: IncomeExpensesSectionModel,
  incomeOrExpense: TIncomeOrExpense
): readonly ProfitOrLossEntryModel<TIncomeOrExpense>[] {
  return Object.entries(incomeExpensesSection.categories).map<
    ProfitOrLossEntryModel<TIncomeOrExpense>
  >(([categoryId, categoryEntry]) => ({
    type: incomeOrExpense,
    categoryId,
    amount: categoryEntry.total,
  }));
}
