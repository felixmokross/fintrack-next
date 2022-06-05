import dayjs from "dayjs";
import Decimal from "decimal.js-light";
import useSWR, { useSWRConfig } from "swr";
import api from "../api";
import { Modal } from "../modal";
import { useReload } from "../reload";
import { dateFormat } from "../util";
import { TransactionDto } from "./dtos";
import { BookingType } from "./enums";
import { isAppreciationOrDepreciation, isChargeOrDeposit } from "./functions";
import {
  transformValueChangeFormValuesToSaveTransactionDto,
  ValueChangeForm,
} from "./value-change-form";
import { ValueChangeFormSkeleton } from "./value-change-form-skeleton";

const title = "Edit Value Change";

export function EditValueChangeModal({
  transactionId,
  onClose,
}: EditValueChangeModalProps) {
  const transactionUrl = `/api/transactions/${transactionId}`;
  const { data, isValidating } = useSWR<TransactionDto>(transactionUrl, api);
  const { mutate } = useSWRConfig();
  const reload = useReload();

  if (!data || isValidating)
    return (
      <Modal>
        <ValueChangeFormSkeleton title={title} />
      </Modal>
    );

  return (
    <Modal>
      <ValueChangeForm
        title={title}
        initialValues={{
          date: dayjs.utc(data.date).format(dateFormat),
          note: data.note || "",
          valueChange: getValue(data),
        }}
        onSubmit={async (values) => {
          await api(
            transactionUrl,
            "PUT",
            transformValueChangeFormValuesToSaveTransactionDto(
              values,
              getAccountId(data)
            )
          );

          onClose();

          mutate(transactionUrl);
          reload();
        }}
        onClose={onClose}
      />
    </Modal>
  );
}

export interface EditValueChangeModalProps {
  transactionId: string;
  onClose: () => void;
}

function getValue(transaction: TransactionDto): string {
  const booking = transaction.bookings.find(isAppreciationOrDepreciation);

  if (!booking)
    throw new Error(
      "Value change transaction does not have an appreciation nor a depreciation"
    );

  if (booking.type === BookingType.APPRECIATION) {
    return booking.amount;
  }

  return new Decimal(booking.amount).negated().toString();
}

function getAccountId(transaction: TransactionDto): string {
  const booking = transaction.bookings.find(isChargeOrDeposit);
  if (!booking)
    throw new Error(
      "Value change transaction does not have a deposit nor a charge"
    );

  return booking.accountId;
}
