import { ReactElement } from "react";
import { Modal } from "../../components/modal";
import api from "../../lib/api";
import { useReload } from "../../lib/reload";
import { transformValueChangeFormValuesToSaveTransactionDto } from "../../lib/util";
import { ValueChangeFormValues } from "./types";
import { ValueChangeForm } from "./value-change-form";

export function NewValueChangeModal({
  accountId,
  onClose,
}: NewValueChangeModalProps): ReactElement {
  const reload = useReload();
  return (
    <Modal>
      <ValueChangeForm
        title="New Value Change"
        initialValues={{ date: "", note: "", valueChange: "" }}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </Modal>
  );

  async function onSubmit(values: ValueChangeFormValues): Promise<void> {
    await api(
      "/api/transactions",
      "POST",
      transformValueChangeFormValuesToSaveTransactionDto(values, accountId)
    );

    reload();

    onClose();
  }
}

export interface NewValueChangeModalProps {
  accountId: string;
  onClose: () => void;
}
