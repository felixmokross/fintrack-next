import dayjs from "dayjs";
import Decimal from "decimal.js-light";
import Link from "next/link";
import { Button, ButtonVariant } from "../../../components/button";
import ValueDisplay from "../../../components/value-display";
import { AccountUnitDto } from "../../../lib/dtos";
import { AccountCategoryType, AccountUnitKind } from "../../../lib/enums";
import { today } from "../../../lib/today";
import { formatUnitValue, RoundingMode } from "../../../lib/util";
import { AccountCategoryWithAccountsDto } from "./dtos";

export function AccountList({ accountCategories }: AccountListProps) {
  return (
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
                                    value={a.currentBalance.valueInAccountUnit}
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
  );
}

export type AccountListProps = {
  accountCategories: AccountCategoryWithAccountsDto[];
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
