import { dropRight, last, orderBy } from "lodash";
import { Doughnut } from "react-chartjs-2";
import { byKey, sum } from "../shared/util";
import { formatAllocationLabel } from "./format-allocation-label";
import "chartjs-plugin-datalabels";
import Decimal from "decimal.js-light";
import { getDb } from "../shared/mongodb.server";
import { MonthBalances } from "../shared/balances/documents.server";
import { AccountCategory } from "../shared/account-categories/documents.server";
import { useRouter } from "next/router";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { ChartPageShell } from "../shared/chart-page-shell";
import { ButtonGroup } from "../shared/button-group";

export default function AllocationPage({ data, total }: AllocationPageProps) {
  const { query, replace } = useRouter();
  const allocationMonthBalances =
    query.allocationMonthBalances as AllocationMonthBalances;
  if (!data) return <p>No data</p>;

  return (
    <ChartPageShell>
      <div className="flex flex-col px-8">
        <div className="flex shrink-0 space-x-8 pt-4 pb-3">
          <div className="flex rounded-md shadow-sm">
            <ButtonGroup // TODO these should be made links
              className="rounded-l-md"
              isActive={
                (allocationMonthBalances as AllocationMonthBalances) ===
                "begin-of-month"
              }
              onClick={() => replace("begin-of-month")}
            >
              Begin of Month
            </ButtonGroup>
            <ButtonGroup
              className="-ml-px rounded-r-md"
              isActive={allocationMonthBalances === "today"}
              onClick={() => replace("today")}
            >
              Today
            </ButtonGroup>
          </div>
        </div>
        <div className="grow">
          <Doughnut
            data={{
              labels: data.map(([label]) => label),
              datasets: [{ data: data.map(([, value]) => value) }],
            }}
            options={{
              maintainAspectRatio: false,
              layout: { padding: 30 },
              plugins: {
                datalabels: {
                  formatter: (value, { dataIndex }) =>
                    formatAllocationLabel(
                      data[dataIndex][0],
                      value,
                      new Decimal(total!)
                    ),
                  backgroundColor: "#3B82F6",
                  borderRadius: 4,
                  color: "white",
                  font: { weight: "normal" },
                  padding: 6,
                  align: "end",
                  anchor: "end",
                },
                legend: { display: false },
                tooltip: { enabled: false },
              },
            }}
          />
        </div>
      </div>
    </ChartPageShell>
  );
}

export type AllocationPageProps = {
  data?: [string, number][];
  total?: string;
};

export const getServerSideProps = withPageAuthRequired<
  AllocationPageProps,
  AllocationPageParams
>({
  getServerSideProps: async ({ params }) => {
    if (!params) throw new Error("No params set!");

    const db = await getDb();
    const monthBalances = await db
      .collection<MonthBalances>("monthBalances")
      .find()
      .sort({ _id: 1 })
      .toArray();

    const accountCategoriesById = byKey(
      await db
        .collection<AccountCategory>("accountCategories")
        .find()
        .sort({ order: 1 })
        .toArray(),
      (ac) => ac._id.toHexString()
    );

    const monthBeginBalances = last(
      params.allocationMonthBalances === "begin-of-month"
        ? dropRight(monthBalances, 1)
        : monthBalances
    );
    if (!monthBeginBalances) return { props: {} };

    const data = orderBy(
      Object.entries(monthBeginBalances.accountCategories)
        .map<[AccountCategory, number]>(([categoryId, value]) => [
          accountCategoriesById[categoryId],
          parseFloat(value.toString()),
        ])
        .filter(([, value]) => value > 0),
      ([c]) => c.order
    ).map<[string, number]>(([category, value]) => [category.name, value]);

    const total = sum(data.map(([, value]) => value)).toString();

    return { props: { data, total } };
  },
});

type AllocationPageParams = {
  allocationMonthBalances: AllocationMonthBalances;
};

type AllocationMonthBalances = "begin-of-month" | "today";
