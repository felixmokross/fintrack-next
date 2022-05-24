import type { GetServerSideProps, NextPage } from "next";
import { Button, ButtonVariant } from "../components/button";
import { Account, AccountCategory } from "../lib/documents.server";
import { AccountCategoryDto, AccountDto, AccountUnitDto } from "../lib/dtos";
import { AccountCategoryType, AccountUnitKind } from "../lib/enums";
import { getDb } from "../lib/mongodb.server";
import { formatUnitValue, RoundingMode } from "../lib/util";
import { groupBy } from "lodash";
import { toAccountCategoryDto, toAccountDto } from "../lib/mappings.server";
import Decimal from "decimal.js-light";
import dayjs from "dayjs";
import { today } from "../lib/today";
import Link from "next/link";
import ValueDisplay from "../components/value-display";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

const AccountsPage: NextPage<AccountsPageProps> = ({ accountCategories }) => {
  return (
    <div className="md:grid-cols-accounts-md lg:grid-cols-accounts-lg xl:grid-cols-accounts-xl 2xl:grid-cols-accounts-2xl grid grid-rows-accounts md:grid-rows-none">
      <section aria-label="Account List" className="overflow-hidden border-b">
        <div className="h-full overflow-auto py-4 pl-8 pr-4">
          <div className="mr-4 text-right">
            <Button
              variant={ButtonVariant.SECONDARY}
              // onClick={() => setShowNewAccountModal(true)}
            >
              New Account
            </Button>
            {/* {showNewAccountModal && (
              <NewAccountModal onClose={() => setShowNewAccountModal(false)} />
            )} */}
          </div>
          <ul className="mt-6 space-y-10">
            {accountCategories.map((ac) => (
              <li key={ac._id}>
                <div>
                  <div className="mr-4 flex items-start justify-between">
                    <h1 className="text-3xl font-light">{ac.name}</h1>
                    <h2>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        CHF
                      </span>
                      <span className="text-3xl font-light">
                        {" "}
                        {formatUnitValue(
                          ac.currentBalance,
                          RoundingMode.ROUND_TO_THOUSANDS,
                          ac.type === AccountCategoryType.LIABILITY
                        )}
                      </span>
                    </h2>
                  </div>
                  <ul className="grid grid-cols-2 md:flex md:flex-row md:flex-wrap">
                    {ac.accounts
                      .filter(
                        (a) =>
                          a.isActive ||
                          !new Decimal(
                            a.currentBalance.valueInAccountUnit
                          ).isZero()
                      )
                      .filter(
                        (a) =>
                          !a.closingDate ||
                          dayjs.utc(a.closingDate).isSameOrAfter(today(), "day")
                      )
                      .map((a) => (
                        <li key={a._id}>
                          <Link href={`/accounts/${a._id}`}>
                            <a className="mt-4 mr-4 flex h-32 flex-col justify-between rounded-md border border-gray-300 bg-gray-50 p-3 shadow-lg hover:bg-gray-100 dark:border-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700  md:w-52 lg:w-72">
                              <div className="text-right">
                                <h3>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    CHF
                                  </span>
                                  <span className="ml-1 text-3xl font-light">
                                    {" "}
                                    {formatUnitValue(
                                      a.currentBalance.valueInReferenceCurrency,
                                      RoundingMode.ROUND_TO_THOUSANDS,
                                      a.categoryType ===
                                        AccountCategoryType.LIABILITY
                                    )}
                                  </span>
                                </h3>
                                {isReferenceCurrency(a.unit) && (
                                  <h4 className="text-sm text-gray-500 dark:text-gray-400">
                                    {getAccountUnitLabel(a.unit)}{" "}
                                    <ValueDisplay
                                      value={
                                        a.currentBalance.valueInAccountUnit
                                      }
                                      unit={a.unit}
                                      showInverted={
                                        a.categoryType ===
                                        AccountCategoryType.LIABILITY
                                      }
                                    />
                                  </h4>
                                )}
                              </div>
                              <h2 className="mt-3 truncate text-left text-sm font-medium text-blue-500 dark:text-blue-400">
                                {a.name}
                              </h2>
                            </a>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section
        aria-label="Account Detail"
        className="flex flex-col overflow-hidden"
      >
        <div></div>
        {/* <Routes>
          <Route path=":accountId" element={<AccountDetail />} />
        </Routes> */}
      </section>
    </div>
  );
};

export default AccountsPage;

export type AccountsPageProps = {
  accountCategories: AccountCategoryWithAccountsDto[];
};

export const getServerSideProps = withPageAuthRequired<AccountsPageProps>({
  getServerSideProps: async () => {
    const db = await getDb();
    const accountsByCategoryId = groupBy(
      (
        await db
          .collection<Account>("accounts")
          .find()
          .sort({ name: 1, unit: 1, "unit.currency": 1 })
          .toArray()
      ).map(toAccountDto),
      (ac) => ac.categoryId
    );

    return {
      props: {
        accountCategories: (
          await db
            .collection<AccountCategory>("accountCategories")
            .find()
            .sort({ order: 1 })
            .toArray()
        )
          .map(toAccountCategoryDto)
          .map((ac) => ({
            ...ac,
          }))
          .map((ac) => ({
            ...ac,
            accounts: accountsByCategoryId[ac._id],
          })),
      },
    };
  },
});

type AccountCategoryWithAccountsDto = AccountCategoryDto & {
  accounts: AccountDto[];
};

function isReferenceCurrency(unit: AccountUnitDto): boolean {
  return unit.kind !== AccountUnitKind.CURRENCY || unit.currency !== "CHF";
}

function getAccountUnitLabel(unit: AccountUnitDto): string {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return unit.currency;
    case AccountUnitKind.STOCK:
      return "Qty.";
  }
}
