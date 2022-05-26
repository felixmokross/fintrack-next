import { ReactElement } from "react";
import { Modal } from "../../components/modal";
import { ValueChangeFormValues } from "./types";
import { ValueChangeForm } from "./value-change-form";

export function NewValueChangeModal({ accountId, onClose }: NewValueChangeModalProps): ReactElement {
    // const invalidateCalculations = useInvalidateCalculations();
    // const api = useApi<void, SaveTransactionDto>();
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
        // await api("/api/transactions", "POST", transformValueChangeFormValuesToSaveTransactionDto(values, accountId));

        // await invalidateCalculations();

        onClose();
    }
}

export interface NewValueChangeModalProps {
    accountId: string;
    onClose: () => void;
}
