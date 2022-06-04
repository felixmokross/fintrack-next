import { useState } from "react";
import api from "../shared/api";
import { Button, ButtonVariant } from "../shared/button";
import { Modal, ModalBody, ModalFooter, ModalSize } from "../shared/modal";
import { useReload } from "../shared/reload";

export function DeleteTransactionModal({
  transactionId,
  onClose,
}: DeleteTransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const reload = useReload();
  return (
    <Modal size={ModalSize.SMALL}>
      <ModalBody title="Delete Transaction">
        <p className="mt-2 text-sm text-gray-500">
          Are you sure that you want to delete this transaction?
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          variant={ButtonVariant.DANGER}
          onClick={async () => {
            setIsLoading(true);
            await deleteTransaction(transactionId);

            // Modal is closed before refetching is done because the day ledger line in which the modal is contained does not exist after refetching
            onClose();
            setIsLoading(false);

            reload();
          }}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Delete
        </Button>
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={onClose}
          autoFocus={true}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
  async function deleteTransaction(transactionId: string): Promise<void> {
    await api(`/api/transactions/${transactionId}`, "DELETE");
  }
}

export interface DeleteTransactionModalProps {
  transactionId: string;
  onClose: () => void;
}
