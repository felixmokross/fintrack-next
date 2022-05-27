import { ReactElement, useState } from "react";
import { DropdownButton } from "../../shared/dropdown/dropdown-button";
import { AccountDetailDto } from "../../shared/accounts/dtos";
import NewTransactionModal, {
  TransactionTemplate,
} from "../../shared/transactions/new-transaction-modal";
import Dropdown, {
  DropdownTriggerButtonVariant,
} from "../../shared/dropdown/dropdown";

export function NewTransactionDropdown({
  account,
}: NewTransactionDropdownProps): ReactElement {
  const [transactionTemplate, setTransactionTemplate] =
    useState<TransactionTemplate | null>(null);
  return (
    <>
      <Dropdown
        id="new-transaction-menu"
        label="New Transaction"
        menuClassName="right-0 mt-2"
        triggerButtonVariant={DropdownTriggerButtonVariant.PRIMARY}
      >
        <DropdownButton
          onClick={() => setTransactionTemplate(TransactionTemplate.EXPENSE)}
        >
          Expense
        </DropdownButton>
        <DropdownButton
          onClick={() => setTransactionTemplate(TransactionTemplate.INCOME)}
        >
          Income
        </DropdownButton>
        <DropdownButton
          onClick={() =>
            setTransactionTemplate(TransactionTemplate.TRANSFER_OUT)
          }
        >
          Transfer Out
        </DropdownButton>
        <DropdownButton
          onClick={() =>
            setTransactionTemplate(TransactionTemplate.TRANSFER_IN)
          }
        >
          Transfer In
        </DropdownButton>
      </Dropdown>

      {transactionTemplate && (
        <NewTransactionModal
          account={account}
          onClose={() => setTransactionTemplate(null)}
          template={transactionTemplate}
        />
      )}
    </>
  );
}

export interface NewTransactionDropdownProps {
  account: AccountDetailDto;
}
