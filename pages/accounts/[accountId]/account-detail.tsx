import dayjs from "dayjs";
import { useState } from "react";
import { AccountDetailDto, AccountUnitDto } from "../../shared/accounts/dtos";
import { AccountType, AccountUnitKind } from "../../shared/accounts/enums";
import { dateFormat } from "../../shared/util";
import AccountActionsMenu from "./account-actions-menu";
import EditableAccountName from "./editable-account-name";
import { NewTransactionDropdown } from "./new-transaction-dropdown";
import { NewValueChangeModal } from "../../shared/transactions/new-value-change-modal";
import { CloseIcon } from "../../shared/icons";
import { Button, ButtonVariant } from "../../shared/button";

export function AccountDetail({ account }: AccountDetailProps) {
  const [newValueChangeModalOpen, setNewValueChangeModalOpen] = useState(false);
  return (
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
  );
}

export type AccountDetailProps = {
  account: AccountDetailDto;
};

function AccountUnitLabel({ unit }: { unit: AccountUnitDto }) {
  switch (unit.kind) {
    case AccountUnitKind.CURRENCY:
      return <h2 title="Currency">{unit.currency}</h2>;
    case AccountUnitKind.STOCK:
      return <>STOCK</>; // TODO
    //   return (
    //     <CollectionItemQuery
    //       itemKey={unit.stockId}
    //       options={stocksByIdQuery()}
    //       loadingIndicator={
    //         <h2>
    //           <TextSkeleton length={TextSkeletonLength.EXTRA_SHORT} />
    //         </h2>
    //       }
    //       render={(stock) => <h2 title="Stock Symbol">{stock.symbol}</h2>}
    //     />
    //   );
  }
}
