import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import dayjs from "dayjs";
import { orderBy } from "lodash";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRefData } from "../../../ref-data-context";
import {
  IncomeExpensesSection,
  MonthPeriod,
  Period,
  ProfitOrLossEntry,
  TransferProfitOrLossSection,
  ValueProfitOrLossSection,
} from "../../../shared/periods/documents.server";
import {
  IncomeExpenseRefDto,
  PeriodDto,
  ProfitOrLossEntryDto,
  SectionWithCategoriesDto,
  TransferProfitOrLossSectionDto,
  ValueProfitOrLossSectionDto,
} from "../../../shared/periods/dtos";
import { PeriodType } from "../../../shared/periods/enums";
import { TextSkeleton, TextSkeletonLength } from "../../../shared/skeletons";
import {
  formatUnitValue,
  RoundingMode,
  sum,
  transformRecord,
} from "../../../shared/util";
import { getTenantDb } from "../../../shared/util.server";

const PeriodDetailPage: NextPage<PeriodDetailPageProps> = ({ period }) => {
  return (
    <div className="flex gap-12">
      <table>
        <thead>
          <tr>
            <th className="text-left">Profit</th>
            <th className="text-left">Type</th>
            <th className="text-right">Amount</th>
          </tr>
          <tr>
            <th className="text-left" colSpan={2}>
              Total
            </th>
            <th className="text-right">
              {formatUnitValue(
                sum(period.profits.map((p) => p.amount)).toNumber(),
                RoundingMode.ROUND_TO_THOUSANDS
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {orderBy(period.profits, (p) => parseFloat(p.amount), "desc").map(
            (p) => (
              <tr key={`${p.type}-${p.categoryId}`}>
                <td>
                  <CategoryLabel type={p.type} categoryId={p.categoryId} />
                </td>
                <td>{p.type}</td>
                <td className="text-right">
                  {formatUnitValue(p.amount, RoundingMode.ROUND_TO_THOUSANDS)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th className="text-left">Loss</th>
            <th className="text-left">Type</th>
            <th className="text-right">Amount</th>
          </tr>
          <tr>
            <th className="text-left" colSpan={2}>
              Total
            </th>
            <th className="text-right">
              {formatUnitValue(
                sum(period.losses.map((l) => l.amount)).toNumber(),
                RoundingMode.ROUND_TO_THOUSANDS
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {orderBy(period.losses, (p) => parseFloat(p.amount), "desc").map(
            (p) => (
              <tr key={`${p.type}-${p.categoryId}`}>
                <td>
                  <CategoryLabel type={p.type} categoryId={p.categoryId} />
                </td>
                <td>{p.type}</td>
                <td className="text-right">
                  {formatUnitValue(p.amount, RoundingMode.ROUND_TO_THOUSANDS)}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PeriodDetailPage;

export type PeriodDetailPageProps = {
  period: PeriodDto;
};

export type PeriodDetailPageParams = {
  granularity: Granularity;
  period: string;
};

export const getServerSideProps = withPageAuthRequired<
  PeriodDetailPageProps,
  PeriodDetailPageParams
>({
  getServerSideProps: async ({ req, res, params }) => {
    const db = await getTenantDb(req, res);

    const period = await db
      .collection<MonthPeriod>("monthPeriods")
      .findOne({ _id: getPeriodId() });
    if (!period) {
      return { notFound: true };
    }

    return {
      props: {
        period: toPeriodDto(period),
      },
    };

    function getPeriodId() {
      if (!params) throw new Error("params is required");
      switch (params.granularity) {
        case "months":
          return dayjs.utc(params.period, "YYYY-MM").toDate();
        case "quarters":
          return dayjs.utc(params.period, "YYYY-[q]Q").toDate();
        case "years":
          return dayjs.utc(params.period, "YYYY").toDate();
      }
    }
  },
});

function CategoryLabel({
  type,
  categoryId,
}: {
  type: "income" | "expense" | "value" | "transfers";
  categoryId: string | null;
}) {
  const { expenseCategories, incomeCategories, valueTypes } = useRefData();
  const { query } = useRouter();

  const monthLimit = query.granularity as Granularity;
  const period = query.period as string;

  if (!expenseCategories || !incomeCategories || !valueTypes)
    return <TextSkeleton length={TextSkeletonLength.MEDIUM} />;

  switch (type) {
    case "expense":
      if (!categoryId) throw new Error("categoryId must be set");
      return (
        <Link
          href={`/periods/${monthLimit}/details/${period}/expense/${categoryId}`}
        >
          <a>{expenseCategories[categoryId].name}</a>
        </Link>
      );
    case "income":
      if (!categoryId) throw new Error("categoryId must be set");
      return (
        <Link
          href={`/periods/${monthLimit}/details/${period}/income/${categoryId}`}
        >
          <a>{incomeCategories[categoryId].name}</a>
        </Link>
      );
    case "value":
      if (!categoryId) throw new Error("categoryId must be set");
      return (
        <Link
          href={`/periods/${monthLimit}/details/${period}/value/${categoryId}`}
        >
          <a>{valueTypes[categoryId].name}</a>
        </Link>
      );
    case "transfers":
      return (
        <Link href={`/periods/${monthLimit}/details/${period}/transfers`}>
          <a>Transfers</a>
        </Link>
      );
  }
}

type Granularity = "years" | "quarters" | "months";

function toPeriodDto<TPeriodType extends PeriodType>(
  period: Period<TPeriodType>
): PeriodDto {
  return {
    _id: period._id.toUTCString(),
    type: period.type,
    profits: period.profits.map(profitOrLossEntryToDto),
    losses: period.losses.map(profitOrLossEntryToDto),
    income: incomeExpensesSectionToSectionWithCategoriesDto(period.income),
    expenses: incomeExpensesSectionToSectionWithCategoriesDto(period.expenses),
    valueProfitOrLoss: valueProfitOrLossSectionToDto(period.valueProfitOrLoss),
    transferProfitOrLoss: transferProfitOrLossSectionToDto(
      period.transferProfitOrLoss
    ),
    profitOrLoss: period.profitOrLoss.toString(),
    cashFlow: period.cashFlow.toString(),
  };
}

function transferProfitOrLossSectionToDto(
  section: TransferProfitOrLossSection
): TransferProfitOrLossSectionDto {
  return {
    transfers: transformRecord(section.transfers, (v) => v.toString()),
    total: section.total.toString(),
  };
}

function profitOrLossEntryToDto<TIncomeOrExpense extends "income" | "expense">(
  profitOrLossEntry: ProfitOrLossEntry<TIncomeOrExpense>
): ProfitOrLossEntryDto<TIncomeOrExpense> {
  return {
    type: profitOrLossEntry.type,
    amount: profitOrLossEntry.amount.toString(),
    categoryId: profitOrLossEntry.categoryId
      ? profitOrLossEntry.categoryId.toHexString()
      : null,
  };
}

function incomeExpensesSectionToSectionWithCategoriesDto(
  section: IncomeExpensesSection
): SectionWithCategoriesDto {
  return {
    categories: transformRecord(section.categories, (c) => ({
      bookings: c.bookings.map<IncomeExpenseRefDto>((b) => ({
        transactionId: b.transactionId.toHexString(),
        date: b.date.toUTCString(),
        transactionNote: b.transactionNote || null,
        bookingNote: b.bookingNote || null,
        currency: b.currency,
        amount: b.amount.toString(),
        amountInReferenceCurrency: b.amountInReferenceCurrency.toString(),
      })),
      total: c.total.toString(),
    })),
    total: section.total.toString(),
  };
}

function valueProfitOrLossSectionToDto(
  section: ValueProfitOrLossSection
): ValueProfitOrLossSectionDto {
  return {
    stocks: transformRecord(section.stocks, (v) => v.toString()),
    currencies: transformRecord(section.currencies, (v) => v.toString()),
    valuatedAccounts: transformRecord(section.valuatedAccounts, (v) =>
      v.toString()
    ),
    accountCategories: transformRecord(section.accountCategories, (v) =>
      v.toString()
    ),
    accounts: transformRecord(section.accounts, (v) => v.toString()),
    valueTypes: transformRecord(section.valueTypes, (v) => v.toString()),
    valueSubtypes: transformRecord(section.valueSubtypes, (v) => v.toString()),
    total: section.total.toString(),
  };
}
