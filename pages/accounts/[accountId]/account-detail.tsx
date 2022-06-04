import dayjs from "dayjs";
import { useState } from "react";
import { dateFormat } from "../../shared/util";
import AccountActionsMenu from "./account-actions-menu";
import EditableAccountName from "./editable-account-name";
import { NewTransactionDropdown } from "./new-transaction-dropdown";
import { NewValueChangeModal } from "../../shared/transactions/new-value-change-modal";
import { CloseIcon } from "../../shared/icons";
import { Button, ButtonVariant } from "../../shared/button";
import { AccountType, AccountUnitKind } from "../shared/enums";
import { AccountUnitDto, StockAccountUnitDto } from "../shared/dtos";
import { AccountDetailDto } from "./dtos";
import { useRefData } from "../../ref-data-context";
import { TextSkeleton, TextSkeletonLength } from "../../shared/skeletons";
import { DayLedgerDto } from "../../shared/day-ledgers/dtos";
import { AccountCategoryType } from "../../shared/account-categories/enums";
import ValueDisplay from "../../shared/value-display";
import DayLedgerRowGroup from "./day-ledger-row-group";

export function AccountDetail({ account, dayLedgers }: AccountDetailProps) {
  const [newValueChangeModalOpen, setNewValueChangeModalOpen] = useState(false);
  return (
    <>
      <div>
        <div className="flex flex-row items-start space-x-4 border-b border-gray-300 px-8 py-4 dark:border-gray-500">
          <div className="grow">
            <EditableAccountName account={account} />
            <div className="mt-2 flex flex-row space-x-8 text-sm text-gray-500 dark:text-gray-300">
              <AccountUnitLabel unit={account.unit} />
              {account.closingDate && (
                <div className="flex items-center">
                  <CloseIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-300" />{" "}
                  Closed by {dayjs.utc(account.closingDate).format(dateFormat)}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <div className="h-5">
              <AccountActionsMenu account={account} />
            </div>
            <div>
              {account.type === AccountType.TRACKED && (
                <NewTransactionDropdown account={account} />
              )}
              {account.type === AccountType.VALUATED && (
                <>
                  <Button
                    variant={ButtonVariant.PRIMARY}
                    onClick={() => setNewValueChangeModalOpen(true)}
                  >
                    New Value Change
                  </Button>
                  {newValueChangeModalOpen && (
                    <NewValueChangeModal
                      accountId={account._id}
                      onClose={() => setNewValueChangeModalOpen(false)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-full overflow-auto">
        <table className="w-full">
          {dayLedgers.map((dl) => (
            <DayLedgerRowGroup
              key={dl._id.date}
              dayLedger={dl}
              accountCategoryType={account.categoryType}
              accountUnit={account.unit}
            />
          ))}
          <tfoot>
            <tr
              className="bg-gray-100 dark:bg-gray-800"
              title="Opening Balance"
            >
              <th
                colSpan={2}
                className="py-2 pl-8 text-right font-normal text-gray-500 dark:text-gray-400"
              >
                <ValueDisplay
                  value={account.openingBalance ? account.openingBalance : 0}
                  unit={account.unit}
                  showInverted={
                    account.categoryType === AccountCategoryType.LIABILITY
                  }
                />
              </th>
              <th className="w-8" />
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export type AccountDetailProps = {
  account: AccountDetailDto;
  dayLedgers: DayLedgerDto[];
};

function AccountUnitLabel({ unit }: { unit: AccountUnitDto }) {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return <h2 title="Currency">{unit.currency}</h2>;
    case AccountUnitKind.STOCK:
      return <StockAccountUnitLabel unit={unit} />;
  }
}

function StockAccountUnitLabel({ unit }: { unit: StockAccountUnitDto }) {
  const { stocks } = useRefData();
  if (!stocks) return <TextSkeleton length={TextSkeletonLength.EXTRA_SHORT} />;

  return <h2 title="Stock Symbol">{stocks[unit.stockId].symbol}</h2>;
}
