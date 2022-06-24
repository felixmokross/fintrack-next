import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import dayjs, { Dayjs } from "dayjs";
import Decimal from "decimal.js-light";
import { flatten, groupBy, orderBy, takeRight, uniq } from "lodash";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRefData } from "../../../../ref-data-context";
import { ButtonGroup } from "../../../../shared/button-group";
import { FintrackChart } from "../../../../shared/chart-utils";
import { cn } from "../../../../shared/classnames";
import Dropdown from "../../../../shared/dropdown/dropdown";
import { DropdownButton } from "../../../../shared/dropdown/dropdown-button";
import { DropdownMenuSize } from "../../../../shared/dropdown/dropdown-menu";
import { ExpenseCategoryDto } from "../../../../shared/expense-categories/dtos";
import { IncomeCategoryDto } from "../../../../shared/income-categories/dtos";
import {
  IncomeExpensesSection,
  MonthPeriod,
  ValueProfitOrLossSection,
} from "../../../../shared/periods/documents.server";
import { deserializeDecimal } from "../../../../shared/serialization.server";
import { ButtonSkeleton } from "../../../../shared/skeletons";
import {
  formatUnitValue,
  getTitle,
  RoundingMode,
  sum,
} from "../../../../shared/util";
import { getTenantDb } from "../../../../shared/util.server";

const PeriodsPage: NextPage<PeriodsPageProps> = ({
  data,
  valueTypeIds,
  usedStockIds,
  usedCurrencies,
  usedAccountIds,
}) => {
  const { query, replace, push } = useRouter();
  const { incomeCategories, expenseCategories, valueTypes } = useRefData();

  const granularity = query.granularity as Granularity;
  const monthLimit = query.monthLimit as MonthLimit;
  const section = query.section as Section;
  const selectedCategoryId = query.selectedCategoryId as string | undefined;

  const colors = data.map(([, , value]) => (value >= 0 ? "059669" : "#DC2626"));

  return (
    <div className="flex flex-col px-8">
      <Head>
        <title>{getTitle("Periods")}</title>
      </Head>
      <div className="flex shrink-0 space-x-8 pt-4 pb-3">
        <div className="flex rounded-md shadow-sm">
          <ButtonGroup // TODO these should be made links
            className="rounded-l-md"
            isActive={granularity === "years"}
            onClick={() => replace(`/periods/years/all/${section}`)}
          >
            Years
          </ButtonGroup>
          <ButtonGroup
            className="-ml-px"
            isActive={granularity === "quarters"}
            onClick={() =>
              replace(
                `/periods/quarters/${
                  numberOfMonthsByMonthLimit[monthLimit] < 12
                    ? "1y"
                    : monthLimit
                }/${section}`
              )
            }
          >
            Quarters
          </ButtonGroup>
          <ButtonGroup
            className="-ml-px rounded-r-md"
            isActive={granularity === "months"}
            onClick={() => replace(`/periods/months/${monthLimit}/${section}`)}
          >
            Months
          </ButtonGroup>
        </div>
        {granularity !== "years" && (
          <div className="flex rounded-md shadow-sm">
            {getMonthLimitButtons().map((mlb, index, { length }) => (
              <ButtonGroup
                key={mlb.monthLimit}
                className={cn({
                  "rounded-l-md": index === 0,
                  "-ml-px": index > 0,
                  "rounded-r-md": index === length - 1,
                })}
                onClick={() =>
                  replace(
                    `/periods/${granularity}/${mlb.monthLimit}/${section}`
                  )
                }
                isActive={monthLimit === mlb.monthLimit}
                title={mlb.title}
              >
                {mlb.label}
              </ButtonGroup>
            ))}
          </div>
        )}

        <div className="flex rounded-md shadow-sm">
          {sectionButtons.map((sectionButton, index, { length }) => (
            <ButtonGroup
              key={sectionButton.section}
              className={cn({
                "rounded-l-md": index === 0,
                "-ml-px": index > 0,
                "rounded-r-md": index === length - 1,
              })}
              isActive={section === sectionButton.section}
              onClick={() => {
                replace(
                  `/periods/${granularity}/${monthLimit}/${sectionButton.section}`
                );
              }}
              title={sectionButton.title}
            >
              {sectionButton.label}
            </ButtonGroup>
          ))}
        </div>

        {section === "income" && (
          <SelectCategoryDropdown
            categories={incomeCategories}
            selectedCategoryId={selectedCategoryId}
          />
        )}

        {section === "expenses" && (
          <SelectCategoryDropdown
            categories={expenseCategories}
            selectedCategoryId={selectedCategoryId}
          />
        )}

        {section === "value-pl-by-asset" && (
          <SelectValueProfitOrLossByAssetCategoryDropdown
            selectedCategoryId={selectedCategoryId}
            usedStockIds={usedStockIds}
            usedAccountIds={usedAccountIds}
            usedCurrencies={usedCurrencies}
          />
        )}

        {section === "value-pl-by-value-type" && (
          <SelectCategoryDropdown
            categories={valueTypes}
            categoryFilter={(c) => valueTypeIds.includes(c._id)}
            selectedCategoryId={selectedCategoryId}
          />
        )}
      </div>
      <div className="grow">
        <FintrackChart
          type="bar"
          data={{
            labels: data.map(([, label]) => label),
            datasets: [
              {
                data: data.map(([, , value]) => value),
                backgroundColor: colors,
                hoverBackgroundColor: colors,
              },
            ],
          }}
          options={{
            onClick: (e, __, chart) => {
              if (e.x === null) return;
              const index = chart.scales.x.getValueForPixel(e.x);
              if (index === undefined) return;

              push(`/periods/${granularity}/${data[index][0]}`);
            },
            maintainAspectRatio: false,
            layout: { padding: { top: 30 } },
            plugins: {
              datalabels: {
                formatter: (value) =>
                  formatUnitValue(value, RoundingMode.ROUND_TO_THOUSANDS),
                backgroundColor: "#3B82F6",
                borderRadius: 4,
                color: "white",
                font: { weight: "normal" },
                padding: 6,
                align: "end",
                anchor: "end",
              },
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ({ raw }) => formatUnitValue(raw as number),
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) =>
                    formatUnitValue(value, RoundingMode.ROUND_TO_THOUSANDS),
                },
              },
            },
          }}
        />
      </div>
    </div>
  );

  function getMonthLimitButtons(): readonly MonthLimitButtonData[] {
    if (granularity === "quarters") {
      return [
        { label: "All", monthLimit: "all" },
        { label: "2Y", title: "2 Years", monthLimit: "2y" },
        { label: "1Y", title: "1 Year", monthLimit: "1y" },
      ];
    }

    return [
      { label: "All", monthLimit: "all" },
      { label: "2Y", title: "2 Years", monthLimit: "2y" },
      { label: "1Y", title: "1 Year", monthLimit: "1y" },
      { label: "6M", title: "6 Months", monthLimit: "6m" },
      { label: "3M", title: "3 Months", monthLimit: "3m" },
    ];
  }
};

export default PeriodsPage;

export type PeriodsPageProps = {
  data: [string, string, number][];
  valueTypeIds: string[];
  usedStockIds: string[];
  usedCurrencies: string[];
  usedAccountIds: string[];
};

export type PeriodsPageParams = {
  granularity: Granularity;
  monthLimit: MonthLimit;
  section: Section;
  selectedCategoryId?: string;
};

export const getServerSideProps = withPageAuthRequired<
  PeriodsPageProps,
  PeriodsPageParams
>({
  getServerSideProps: async ({ req, res, params }) => {
    if (!params) throw new Error("params is required");
    const { granularity, monthLimit, section, selectedCategoryId } = params;

    const db = await getTenantDb(req, res);
    const periods = await db
      .collection<MonthPeriod>("monthPeriods")
      .find()
      .sort({ _id: 1 })
      .toArray();

    return {
      props: {
        data: selectData(periods),
        valueTypeIds: uniq(
          flatten(
            periods.map((p) => Object.keys(p.valueProfitOrLoss.valueTypes))
          )
        ),
        usedStockIds: uniq(
          flatten(periods.map((p) => Object.keys(p.valueProfitOrLoss.stocks)))
        ),
        usedCurrencies: uniq(
          flatten(
            periods.map((p) => Object.keys(p.valueProfitOrLoss.currencies))
          )
        ),
        usedAccountIds: uniq(
          flatten(
            periods.map((p) =>
              Object.keys(p.valueProfitOrLoss.valuatedAccounts)
            )
          )
        ),
      },
    };

    function selectData(
      monthPeriods: MonthPeriod[]
    ): [string, string, number][] {
      const data = getDataFromMonthPeriods(monthPeriods);

      switch (granularity) {
        case "years":
          return Object.entries(groupBy(data, ([month]) => month.year())).map<
            [string, string, number]
          >(([year, items], index, { length }) => [
            year,
            index === length - 1 ? "YTD" : year,
            sum(items.map(([, value]) => value)).toNumber(),
          ]);

        case "quarters":
          return takeRight(
            Object.entries(
              groupBy(data, ([month]) => month.startOf("quarter").valueOf())
            ).map<[string, string, number]>(
              ([quarterValue, items], index, { length }) => [
                dayjs.utc(parseInt(quarterValue, 10)).format("YYYY-[Q]Q"),
                index === length - 1
                  ? "QTD"
                  : dayjs.utc(parseInt(quarterValue, 10)).format("[Q]Q YYYY"),
                sum(items.map(([, value]) => value)).toNumber(),
              ]
            ),
            numberOfMonthsByMonthLimit[monthLimit] / 3 + 1
          );

        case "months":
          return takeRight(
            data.map<[string, string, number]>(
              ([month, value], index, { length }) => [
                month.format("YYYY-MM"),
                index === length - 1 ? "MTD" : month.format("MMM YYYY"),
                value.toNumber(),
              ]
            ),
            numberOfMonthsByMonthLimit[monthLimit] + 1
          );
      }
    }

    function getDataFromMonthPeriods(
      monthPeriods: MonthPeriod[]
    ): [Dayjs, Decimal][] {
      switch (section) {
        case "total-pl":
          return monthPeriods.map((mp) => [
            dayjs.utc(mp._id),
            deserializeDecimal(mp.profitOrLoss),
          ]);
        case "income":
          return monthPeriods.map((mp) => [
            dayjs.utc(mp._id),
            getValueFromSectionWithCategories(mp.income),
          ]);
        case "expenses":
          return monthPeriods.map((mp) => [
            dayjs.utc(mp._id),
            getValueFromSectionWithCategories(mp.expenses),
          ]);
        case "value-pl-by-asset":
          return monthPeriods.map((mp) => [
            dayjs.utc(mp._id),
            getValueFromValueProfitOrLossSectionForAsset(mp.valueProfitOrLoss),
          ]);
        case "value-pl-by-value-type":
          return monthPeriods.map((mp) => [
            dayjs.utc(mp._id),
            getValueFromValueProfitOrLossSectionForValueType(
              mp.valueProfitOrLoss
            ),
          ]);
        case "transfer-pl":
          return monthPeriods.map((mp) => [
            dayjs.utc(mp._id),
            deserializeDecimal(mp.transferProfitOrLoss.total),
          ]);
        case "cash-flow":
          return monthPeriods.map((mp) => [
            dayjs.utc(mp._id),
            deserializeDecimal(mp.cashFlow),
          ]);
        default:
          throw new Error("Unsupported section");
      }
    }

    function getValueFromSectionWithCategories(section: IncomeExpensesSection) {
      return selectedCategoryId
        ? section.categories[selectedCategoryId]
          ? deserializeDecimal(section.categories[selectedCategoryId]?.total)
          : new Decimal(0)
        : deserializeDecimal(section.total);
    }

    function getValueFromValueProfitOrLossSectionForValueType(
      dto: ValueProfitOrLossSection
    ) {
      return selectedCategoryId
        ? dto.valueTypes[selectedCategoryId]
          ? deserializeDecimal(dto.valueTypes[selectedCategoryId])
          : new Decimal(0)
        : deserializeDecimal(dto.total);
    }

    function getValueFromValueProfitOrLossSectionForAsset(
      dto: ValueProfitOrLossSection
    ) {
      if (!selectedCategoryId) return deserializeDecimal(dto.total);

      const [prefix, id] = selectedCategoryId.split("-");

      switch (prefix) {
        case "stock":
          return dto.stocks[id]
            ? deserializeDecimal(dto.stocks[id])
            : new Decimal(0);
        case "currency":
          return dto.currencies[id]
            ? deserializeDecimal(dto.currencies[id])
            : new Decimal(0);
        case "account":
          return dto.valuatedAccounts[id]
            ? deserializeDecimal(dto.valuatedAccounts[id])
            : new Decimal(0);
        default:
          throw new Error();
      }
    }
  },
});

type Granularity = "years" | "quarters" | "months";
type MonthLimit = "3m" | "6m" | "1y" | "2y" | "all";
type Section =
  | "total-pl"
  | "income"
  | "expenses"
  | "value-pl-by-asset"
  | "value-pl-by-value-type"
  | "transfer-pl"
  | "cash-flow";

const numberOfMonthsByMonthLimit = {
  "3m": 3,
  "6m": 6,
  "1y": 12,
  "2y": 24,
  all: Infinity,
};

interface MonthLimitButtonData {
  label: string;
  title?: string;
  monthLimit: MonthLimit;
}

interface SectionButtonData {
  label: string;
  title?: string;
  section: Section;
}

const sectionButtons: SectionButtonData[] = [
  {
    label: "Total P/L",
    title: "Total Profit/Loss",
    section: "total-pl",
  },
  { label: "Income", section: "income" },
  { label: "Expenses", section: "expenses" },
  {
    label: "Value P/L by Value Type",
    title: "Value Profit/Loss by Value Type",
    section: "value-pl-by-value-type",
  },
  {
    label: "Value P/L by Asset",
    title: "Value Profit/Loss by Asset",
    section: "value-pl-by-asset",
  },
  {
    label: "Transfer P/L",
    title: "Transfer Profit/Loss",
    section: "transfer-pl",
  },
  {
    label: "Cash Flow",
    title: "Cash Flow",
    section: "cash-flow",
  },
];

function SelectCategoryDropdown<
  TCategory extends IncomeCategoryDto | ExpenseCategoryDto
>({
  categories,
  categoryFilter = () => true,
  selectedCategoryId,
}: SelectCategoryDropdownProps<TCategory>) {
  const { query, replace } = useRouter();

  const granularity = query.granularity as Granularity;
  const monthLimit = query.monthLimit as MonthLimit;
  const section = query.section as Section;

  if (!categories) return <ButtonSkeleton />;

  return (
    <Dropdown
      id="category-menu"
      title="Select Category"
      label={selectedCategoryId ? categories[selectedCategoryId].name : "Total"}
      menuSize={DropdownMenuSize.LARGE}
    >
      <DropdownButton
        onClick={() =>
          replace(`/periods/${granularity}/${monthLimit}/${section}`)
        }
      >
        Total
      </DropdownButton>
      {Object.values(categories)
        .filter(categoryFilter)
        .map((c) => (
          <DropdownButton
            key={c._id}
            onClick={() =>
              replace(
                `/periods/${granularity}/${monthLimit}/${section}/${c._id}`
              )
            }
          >
            {c.name}
          </DropdownButton>
        ))}
    </Dropdown>
  );
}

interface SelectCategoryDropdownProps<
  TCategory extends IncomeCategoryDto | ExpenseCategoryDto
> {
  categories: Record<string, TCategory> | undefined;
  categoryFilter?: (category: TCategory) => boolean;
  selectedCategoryId?: string;
}

function SelectValueProfitOrLossByAssetCategoryDropdown({
  selectedCategoryId,
  usedStockIds,
  usedAccountIds,
  usedCurrencies,
}: SelectValueProfitOrLossByAssetCategoryDropdownProps) {
  const { stocks, currencies, accounts } = useRefData();
  const { query, replace } = useRouter();

  const granularity = query.granularity as Granularity;
  const monthLimit = query.monthLimit as MonthLimit;
  const section = query.section as Section;
  if (!stocks || !currencies || !accounts) return <ButtonSkeleton />;

  const usedStocks = orderBy(
    usedStockIds.map((stockId) => stocks[stockId]),
    (s) => s.symbol
  );
  const usedCurrencyObjects = orderBy(
    usedCurrencies.map((currencyId) => currencies[currencyId]),
    (c) => c.name
  );
  const usedAccounts = orderBy(
    usedAccountIds.map((accountId) => accounts[accountId]),
    (a) => a.name
  );
  return (
    <Dropdown
      id="category-menu"
      title="Select Category"
      label={getCategoryLabel()}
      menuSize={DropdownMenuSize.LARGE}
    >
      <DropdownButton
        onClick={() =>
          replace(`/periods/${granularity}/${monthLimit}/${section}`)
        }
      >
        Total
      </DropdownButton>
      {usedStocks.map((s) => (
        <DropdownButton
          key={s._id}
          onClick={() =>
            replace(
              `/periods/${granularity}/${monthLimit}/${section}/stock-${s._id}`
            )
          }
        >
          {s.symbol}
        </DropdownButton>
      ))}
      {usedCurrencyObjects.map((c) => (
        <DropdownButton
          key={c._id}
          onClick={() =>
            replace(
              `/periods/${granularity}/${monthLimit}/${section}/currency-${c._id}`
            )
          }
        >
          {c.name}
        </DropdownButton>
      ))}
      {usedAccounts.map((a) => (
        <DropdownButton
          key={a._id}
          onClick={() =>
            replace(
              `/periods/${granularity}/${monthLimit}/${section}/account-${a._id}`
            )
          }
        >
          {a.name}
        </DropdownButton>
      ))}
    </Dropdown>
  );

  function getCategoryLabel(): string {
    if (!selectedCategoryId) {
      return "Total";
    }

    const [prefix, id] = selectedCategoryId.split("-");

    switch (prefix) {
      case "stock":
        return stocks![id].symbol;
      case "currency":
        return currencies![id].name;
      case "account":
        return accounts![id].name;
      default:
        throw new Error("Invalid ID!");
    }
  }
}

interface SelectValueProfitOrLossByAssetCategoryDropdownProps {
  selectedCategoryId?: string;
  usedStockIds: string[];
  usedCurrencies: string[];
  usedAccountIds: string[];
}
