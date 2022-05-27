import { ReactElement } from "react";
import {
  transformValueChangeFormValuesToSaveTransactionDto,
  ValueChangeForm,
  ValueChangeFormValues,
} from "./value-change-form";
import { useReload } from "../../../lib/reload";
import { Modal } from "../../../components/modal";
import api from "../../../lib/api";

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
