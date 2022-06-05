import dayjs from "dayjs";
import useSWR, { useSWRConfig } from "swr";
import { useRefData } from "../../ref-data-context";
import api from "../api";
import { Modal, ModalSize } from "../modal";
import { useReload } from "../reload";
import { dateFormat } from "../util";
import {
  BookingDto,
  SaveTransactionBookingDto,
  SaveTransactionChargeDto,
  SaveTransactionDepositDto,
  SaveTransactionExpenseDto,
  SaveTransactionIncomeDto,
  TransactionDto,
} from "./dtos";
import { BookingType } from "./enums";
import { TransactionForm } from "./transaction-form";
import TransactionFormSkeleton from "./transaction-form-skeleton";
import {
  BookingFormValues,
  ChargeDepositFormValues,
  ExpenseFormValues,
  IncomeFormValues,
  TransactionFormValues,
} from "./types";
import { validate } from "./validation";

const title = "Edit Transaction";

export function EditTransactionModal({
  transactionId,
  accountId,
  onClose,
}: EditTransactionModalProps) {
  const transactionUrl = `/api/transactions/${transactionId}`;
  const { data, isValidating } = useSWR<TransactionDto>(transactionUrl, api);
  const { mutate } = useSWRConfig();
  const { accounts } = useRefData();
  const reload = useReload();

  if (!accounts || !data || isValidating)
    return (
      <Modal size={ModalSize.LARGE}>
        <TransactionFormSkeleton title={title} />
      </Modal>
    );

  return (
    <Modal size={ModalSize.LARGE}>
      <TransactionForm
        title={title}
        initialValues={getInitialValues(data)}
        validate={(values) => validate(values, accounts)}
        accountId={accountId}
        onSubmit={async (values) => {
          await updateTransaction({ transactionId, values });

          onClose();

          mutate(transactionUrl);
          reload();
        }}
        onClose={onClose}
      />
    </Modal>
  );

  async function updateTransaction({
    values,
  }: {
    transactionId: string;
    values: TransactionFormValues;
  }): Promise<void> {
    await api(transactionUrl, "PUT", {
      date: dayjs.utc(values.date, dateFormat).format("YYYY-MM-DD"),
      note: values.note || undefined,
      bookings: values.bookings.map(toSaveTransactionBookingDto),
    });
  }
}

export interface EditTransactionModalProps {
  transactionId: string;
  accountId: string;
  onClose: () => void;
}

function getInitialValues(transaction: TransactionDto): TransactionFormValues {
  return {
    date: dayjs.utc(transaction.date).format(dateFormat),
    note: transaction.note || "",
    bookings: transaction.bookings.map(toFormValues),
  };
}

function toFormValues(booking: BookingDto): BookingFormValues {
  switch (booking.type) {
    case BookingType.CHARGE:
    case BookingType.DEPOSIT:
      return {
        type: booking.type,
        accountId: booking.accountId,
        note: booking.note || "",
        amount: booking.amount,
      } as ChargeDepositFormValues;
    case BookingType.INCOME:
      return {
        type: BookingType.INCOME,
        incomeCategoryId: booking.incomeCategoryId,
        note: booking.note || "",
        currency: booking.currency,
        amount: booking.amount,
      } as IncomeFormValues;
    case BookingType.EXPENSE:
      return {
        type: BookingType.EXPENSE,
        expenseCategoryId: booking.expenseCategoryId,
        note: booking.note || "",
        currency: booking.currency,
        amount: booking.amount,
      } as ExpenseFormValues;
    default:
      throw new Error("Unsupported booking type");
  }
}

function toSaveTransactionBookingDto(
  values: BookingFormValues
): SaveTransactionBookingDto {
  switch (values.type) {
    case BookingType.CHARGE:
    case BookingType.DEPOSIT:
      return {
        type: values.type,
        accountId: values.accountId,
        note: values.note || undefined,
        amount: values.amount,
      } as SaveTransactionChargeDto | SaveTransactionDepositDto;
    case BookingType.INCOME:
      return {
        type: BookingType.INCOME,
        incomeCategoryId: values.incomeCategoryId,
        note: values.note || undefined,
        currency: values.currency,
        amount: values.amount,
      } as SaveTransactionIncomeDto;
    case BookingType.EXPENSE:
      return {
        type: BookingType.EXPENSE,
        expenseCategoryId: values.expenseCategoryId,
        note: values.note || undefined,
        currency: values.currency,
        amount: values.amount,
      } as SaveTransactionExpenseDto;
  }
}
