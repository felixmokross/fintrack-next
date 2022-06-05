import { useState } from "react";
import ActionsButton from "../../shared/actions-button";
import Dropdown from "../../shared/dropdown/dropdown";
import { DropdownButton } from "../../shared/dropdown/dropdown-button";
import { DeleteIcon, EditIcon } from "../../shared/icons";
import { EditTransactionModal } from "../../shared/transactions/edit-transaction-modal";
import { EditValueChangeModal } from "../../shared/transactions/edit-value-change-modal";
import { DeleteTransactionModal } from "../../transactions/delete-transaction-modal";

export function ActionsMenu({
  transactionId,
  editMode,
  accountId,
}: ActionsMenuProps) {
  const [
    showEditTransactionOrValueChange,
    setShowEditTransactionOrValueChange,
  ] = useState(false);
  const [showDeleteTransaction, setShowDeleteTransaction] = useState(false);
  return (
    <>
      <Dropdown
        triggerButton={ActionsButton}
        id="actions-menu"
        triggerButtonClassName="invisible group-hover:visible"
        menuClassName="right-0 mr-2"
      >
        <DropdownButton
          icon={EditIcon}
          onClick={() => setShowEditTransactionOrValueChange(true)}
        >
          Edit
        </DropdownButton>
        <DropdownButton
          icon={DeleteIcon}
          onClick={() => setShowDeleteTransaction(true)}
        >
          Delete
        </DropdownButton>
      </Dropdown>
      {showEditTransactionOrValueChange && (
        <>
          {editMode === EditMode.TRANSACTION && (
            <EditTransactionModal
              transactionId={transactionId}
              accountId={accountId}
              onClose={() => setShowEditTransactionOrValueChange(false)}
            />
          )}
          {editMode === EditMode.VALUE_CHANGE && (
            <EditValueChangeModal
              transactionId={transactionId}
              onClose={() => setShowEditTransactionOrValueChange(false)}
            />
          )}
        </>
      )}
      {showDeleteTransaction && (
        <DeleteTransactionModal
          transactionId={transactionId}
          onClose={() => setShowDeleteTransaction(false)}
        />
      )}
    </>
  );
}

export interface ActionsMenuProps {
  transactionId: string;
  accountId: string;
  editMode: EditMode;
}

export enum EditMode {
  TRANSACTION = "TRANSACTION",
  VALUE_CHANGE = "VALUE_CHANGE",
}
