import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import dayjs from "dayjs";
import Decimal from "decimal.js-light";
import { dropRight, last, merge, takeRight } from "lodash";
import { Db } from "mongodb";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useRefData } from "../../../ref-data-context";
import { AccountCategory } from "../../../shared/account-categories/documents.server";
import { AccountCategoryType } from "../../../shared/account-categories/enums";
import { MonthBalances } from "../../../shared/balances/documents.server";
import { ButtonGroup } from "../../../shared/button-group";
import {
  getLineDatasetStyle,
  FintrackChart,
} from "../../../shared/chart-utils";
import { cn } from "../../../shared/classnames";
import { deserializeDecimal } from "../../../shared/serialization.server";
import { ButtonSkeleton } from "../../../shared/skeletons";
import {
  byKey,
  formatUnitValue,
  getTitle,
  RoundingMode,
} from "../../../shared/util";
import { getTenantDb } from "../../../shared/util.server";
import "chartjs-plugin-datalabels";
import Head from "next/head";

const BalancesPage: NextPage<BalancesPageProps, BalancesPageParams> = ({
  data,
}) => {
  const { query, replace } = useRouter();
  const { accountCategories } = useRefData();

  if (!accountCategories) return <BalancesSkeleton />;

  const granularity = query.granularity as Granularity;
  const monthLimit = query.monthLimit as MonthLimit;
  const dataType = query.dataType as DataType;

  return (
    <div className="flex flex-col px-8">
      <Head>
        <title>{getTitle("Balances")}</title>
      </Head>
      <div className="flex shrink-0 space-x-8 pt-4 pb-3">
        <div className="flex rounded-md shadow-sm">
          <ButtonGroup // TODO these should be made links
            className="rounded-l-md"
            isActive={granularity === "years"}
            onClick={() => replace(`/balances/years/${monthLimit}/${dataType}`)}
          >
            Years
          </ButtonGroup>
          <ButtonGroup
            className="-ml-px"
            isActive={granularity === "quarters"}
            onClick={() => {
              replace(
                `/balances/quarters/${
                  numberOfMonthsByMonthLimit[monthLimit] <
                  numberOfMonthsByMonthLimit["1y"]
                    ? "1y"
                    : monthLimit
                }/${dataType}`
              );
            }}
          >
            Quarters
          </ButtonGroup>
          <ButtonGroup
            className="-ml-px rounded-r-md"
            isActive={granularity === "months"}
            onClick={() =>
              replace(`/balances/months/${monthLimit}/${dataType}`)
            }
          >
            Months
          </ButtonGroup>
        </div>
        {granularity !== "years" && (
          <div className="flex rounded-md shadow-sm">
            {getMonthLimitButtons().map((mlb, index, { length }) => (
              <ButtonGroup
                key={mlb.monthLimit}
                title={mlb.title}
                onClick={() =>
                  replace(
                    `/balances/${granularity}/${mlb.monthLimit}/${dataType}`
                  )
                }
                isActive={monthLimit === mlb.monthLimit}
                className={cn({
                  "rounded-l-md": index === 0,
                  "-ml-px": index > 0,
                  "rounded-r-md": index === length - 1,
                })}
              >
                {mlb.label}
              </ButtonGroup>
            ))}
          </div>
        )}
        <div className="flex rounded-md shadow-sm">
          <ButtonGroup
            className="rounded-l-md"
            isActive={dataType === "net-worth"}
            onClick={() =>
              replace(`/balances/${granularity}/${monthLimit}/net-worth`)
            }
          >
            Net Worth
          </ButtonGroup>
          {Object.values(accountCategories).map((ac, index, { length }) => (
            <ButtonGroup
              className={cn("-ml-px", index === length - 1 && "rounded-r-md")}
              key={ac._id}
              isActive={dataType === ac._id}
              onClick={() =>
                replace(`/balances/${granularity}/${monthLimit}/${ac._id}`)
              }
            >
              {ac.name}
            </ButtonGroup>
          ))}
        </div>
      </div>
      <div className="grow">
        <FintrackChart
          type="line"
          data={{
            labels: data.map(([key]) => key),
            datasets: [
              {
                data: data.map(([, value]) => value),
                ...getLineDatasetStyle(),
              },
            ],
          }}
          options={{
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

export default BalancesPage;

export const getServerSideProps = withPageAuthRequired<
  BalancesPageProps,
  BalancesPageParams
>({
  getServerSideProps: async ({ params, req, res }) => {
    if (!params) throw new Error("No params set!");

    const db = await getTenantDb(req, res);

    const [monthBalances, accountCategories] = await Promise.all([
      db
        .collection<MonthBalances>("monthBalances")
        .find()
        .sort({ _id: 1 })
        .toArray(),
      getAccountCategoriesById(db),
    ]);

    return {
      props: {
        data: selectData(
          applyGranularityAndMonthLimit(
            monthBalances,
            params.granularity,
            params.monthLimit
          ),
          accountCategories,
          params.dataType
        ),
      },
    };
  },
});

export type BalancesPageProps = {
  data: [string, number][];
};

export type BalancesPageParams = {
  granularity: Granularity;
  monthLimit: MonthLimit;
  dataType: DataType;
};

type Granularity = "years" | "quarters" | "months";
type MonthLimit = "3m" | "6m" | "1y" | "2y" | "all";
type DataType = "net-worth" | string;

const numberOfMonthsByMonthLimit = {
  "3m": 3,
  "6m": 6,
  "1y": 12,
  "2y": 24,
  all: Infinity,
};

export interface MonthBalancesDto {
  _id: string;
  accountCategories: {
    [accountCategoryId: string]: string;
  };
  netWorth: string;
}

async function getAccountCategoriesById(db: Db) {
  return byKey(
    await db.collection<AccountCategory>("accountCategories").find().toArray(),
    (ac) => ac._id.toHexString()
  );
}

interface MonthLimitButtonData {
  label: string;
  title?: string;
  monthLimit: MonthLimit;
}

function BalancesSkeleton() {
  return (
    <div className="flex flex-col px-8">
      <div className="flex shrink-0 space-x-8 pt-4 pb-3">
        <ButtonSkeleton className="w-60" />
        <ButtonSkeleton className="w-64" />
        <ButtonSkeleton className="w-96" />
      </div>
      <div className="my-7 grow animate-pulse bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

function selectData(
  monthBalances: [string, MonthBalances][],
  accountCategories: Record<string, AccountCategory>,
  dataType: DataType
): [string, number][] {
  switch (dataType) {
    case "net-worth":
      return monthBalances.map(([key, mb]) => [
        key,
        deserializeDecimal(mb.netWorth).toNumber(),
      ]);
    default:
      return monthBalances.map(([key, mb]) => {
        let value = mb.accountCategories[dataType]
          ? deserializeDecimal(mb.accountCategories[dataType]).toNumber()
          : 0;

        if (
          accountCategories[dataType].type === AccountCategoryType.LIABILITY
        ) {
          value = new Decimal(value).negated().toNumber();
        }

        return [key, value];
      });
  }
}

function applyGranularityAndMonthLimit(
  monthBalances: MonthBalances[],
  granularity: Granularity,
  monthLimit: MonthLimit
): [string, MonthBalances][] {
  switch (granularity) {
    case "months":
      return takeRight(
        monthBalances.map((mb, index, { length }) => [
          index === length - 1
            ? "Today"
            : dayjs.utc(mb._id).add(1, "month").format("MMM YYYY"),
          mb,
        ]),
        numberOfMonthsByMonthLimit[monthLimit] + 2
      );

    case "quarters": {
      const lastMonthBalances = last(monthBalances);
      if (!lastMonthBalances) return [];

      const quarterOffset = (dayjs.utc(lastMonthBalances._id).month() + 1) % 3;
      return takeRight(
        dropRight(monthBalances, quarterOffset)
          .filter((_, i, { length }) => (length - i - 1) % 3 === 0)
          .concat(quarterOffset === 0 ? [] : [lastMonthBalances])
          .map((mb, index, { length }) => [
            index === length - 1
              ? "Today"
              : dayjs.utc(mb._id).add(1, "quarter").format("[Q]Q YYYY"),
            mb,
          ]),
        numberOfMonthsByMonthLimit[monthLimit] / 3 + 2
      );
    }

    case "years": {
      const lastMonthBalances = last(monthBalances);
      if (!lastMonthBalances) return [];

      const yearOffset = (dayjs.utc(lastMonthBalances._id).month() + 1) % 12;
      return dropRight(monthBalances, yearOffset)
        .filter((_, i, { length }) => (length - i - 1) % 12 === 0)
        .concat(yearOffset === 0 ? [] : [lastMonthBalances])
        .map((mb, index, { length }) => [
          index === length - 1
            ? "Today"
            : dayjs.utc(mb._id).add(1, "year").format("YYYY"),
          mb,
        ]);
    }
  }
}
