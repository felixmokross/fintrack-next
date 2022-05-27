import { Modal, ModalSize } from "../../../components/modal";
import { AccountDetailDto } from "../../../lib/dtos";

const title = "New Transaction";

export default function NewTransactionModal({
  account,
  onClose,
  template,
}: NewTransactionModalProps): React.ReactElement {
  // const invalidateCalculations = useInvalidateCalculations();
  // const { mutateAsync } = useMutation(createTransactionAsync);
  // const api = useApi<void, SaveTransactionDto>();
  return (
    <Modal size={ModalSize.LARGE}>
      {/* <Query
                options={accountsByIdQuery()}
                loadingIndicator={<TransactionFormSkeleton title={title} />}
                render={(accountsById) => (
                    <TransactionForm
                        title={title}
                        initialValues={getInitialValues(account, template)}
                        validate={(values) => validate(values, accountsById)}
                        accountId={account._id}
                        onSubmit={async (values) => {
                            await mutateAsync(values);

                            await invalidateCalculations();

                            onClose();
                        }}
                        onClose={onClose}
                    />
                )}
            /> */}
    </Modal>
  );

  // async function createTransactionAsync(values: TransactionFormValues): Promise<void> {
  //     await api("/api/transactions", "POST", {
  //         date: dayjs.utc(values.date, dateFormat).format("YYYY-MM-DD"),
  //         note: values.note || undefined,
  //         bookings: values.bookings.map(toSaveTransactionBookingDto),
  //     });
  // }
}

export interface NewTransactionModalProps {
  account: AccountDetailDto;
  onClose: () => void;
  template: TransactionTemplate;
}

// function getInitialValues(account: AccountDetailDto, template: TransactionTemplate): TransactionFormValues {
//     return {
//         date: "",
//         note: "",
//         bookings: getBookings(),
//     };

//     function getBookings(): [BookingFormValues, BookingFormValues] {
//         const currency = account.unit.kind === AccountUnitKind.CURRENCY ? account.unit.currency : "";

//         switch (template) {
//             case TransactionTemplate.EXPENSE:
//                 return [
//                     {
//                         type: BookingType.CHARGE,
//                         note: "",
//                         amount: "",
//                         accountId: account._id,
//                     },
//                     {
//                         type: BookingType.EXPENSE,
//                         note: "",
//                         amount: "",
//                         currency,
//                         expenseCategoryId: "",
//                     },
//                 ];
//             case TransactionTemplate.INCOME:
//                 return [
//                     {
//                         type: BookingType.DEPOSIT,
//                         note: "",
//                         amount: "",
//                         accountId: account._id,
//                     },
//                     {
//                         type: BookingType.INCOME,
//                         note: "",
//                         amount: "",
//                         currency,
//                         incomeCategoryId: "",
//                     },
//                 ];
//             case TransactionTemplate.TRANSFER_IN:
//                 return [
//                     {
//                         type: BookingType.DEPOSIT,
//                         note: "",
//                         amount: "",
//                         accountId: account._id,
//                     },
//                     {
//                         type: BookingType.CHARGE,
//                         note: "",
//                         amount: "",
//                         accountId: "",
//                     },
//                 ];
//             case TransactionTemplate.TRANSFER_OUT:
//                 return [
//                     {
//                         type: BookingType.CHARGE,
//                         note: "",
//                         amount: "",
//                         accountId: account._id,
//                     },
//                     {
//                         type: BookingType.DEPOSIT,
//                         note: "",
//                         amount: "",
//                         accountId: "",
//                     },
//                 ];
//         }
//     }
// }

// function toSaveTransactionBookingDto(values: BookingFormValues): SaveTransactionBookingDto {
//     switch (values.type) {
//         case BookingType.CHARGE:
//         case BookingType.DEPOSIT:
//             return {
//                 type: values.type,
//                 accountId: values.accountId,
//                 note: values.note || undefined,
//                 amount: values.amount,
//             } as SaveTransactionChargeDto | SaveTransactionDepositDto;
//         case BookingType.EXPENSE:
//             return {
//                 type: values.type,
//                 expenseCategoryId: values.expenseCategoryId,
//                 amount: values.amount,
//                 currency: values.currency,
//                 note: values.note || undefined,
//             } as SaveTransactionExpenseDto;
//         case BookingType.INCOME:
//             return {
//                 type: values.type,
//                 incomeCategoryId: values.incomeCategoryId,
//                 amount: values.amount,
//                 currency: values.currency,
//                 note: values.note || undefined,
//             } as SaveTransactionIncomeDto;
//         default:
//             throw new Error("Unsupported booking type");
//     }
// }

export enum TransactionTemplate {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER_IN = "TRANSFER_IN",
  TRANSFER_OUT = "TRANSFER_OUT",
}
