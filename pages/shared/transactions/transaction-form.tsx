import { useFormikContext } from "formik";
import { useState } from "react";
import { AccountDto } from "../../accounts/shared/dtos";
import { isCurrencyUnit } from "../../accounts/shared/util.server";
import { useRefData } from "../../ref-data-context";
import { Button, ButtonVariant } from "../button";
import { cn } from "../classnames";
import { DatepickerInput } from "../datepicker/datepicker-input";
import Form, { FormProps } from "../forms/form";
import { Input } from "../forms/input";
import { Labeled } from "../forms/labeled";
import SubmitButton from "../forms/submit-button";
import { ModalBody, ModalFooter } from "../modal";
import { dateFormat } from "../util";
import {
  SaveTransactionChargeDto,
  SaveTransactionDepositDto,
  SaveTransactionExpenseDto,
  SaveTransactionIncomeDto,
} from "./dtos";
import { BookingType } from "./enums";
import { isChargeOrDeposit } from "./functions";
import TransactionFormSkeleton from "./transaction-form-skeleton";
import { TransactionFormValues } from "./types";
import { AddBookingButton } from "./add-booking-button";
import { BookingsPart } from "./bookings-part";
import { AccountSelect } from "../accounts/account-select";
import { IncomeCategorySelect } from "../income-categories/income-categories";
import { ExpenseCategorySelect } from "../expense-categories/expense-category-select";
import { FormErrorMessage } from "../forms/error-messages";
import { Toggle } from "../toggle";

export function TransactionForm({ title, ...props }: TransactionFormProps) {
  const { accounts } = useRefData();
  if (!accounts) return <TransactionFormSkeleton title={title} />;
  return <InnerTransactionForm title={title} accounts={accounts} {...props} />;
}

export type TransactionFormProps = {
  title: string;
  accountId: string;
  onClose: () => void;
} & FormProps<TransactionFormValues>;

function AddChargeButton() {
  return (
    <AddBookingButton<SaveTransactionChargeDto>
      title="Add Charge"
      values={{ type: BookingType.CHARGE, note: "", amount: "", accountId: "" }}
    >
      Charge
    </AddBookingButton>
  );
}

function InnerTransactionForm({
  title,
  accountId,
  onClose,
  onSubmit,
  validate,
  initialValues,
  accounts,
  ...props
}: InnerTransactionFormProps) {
  const [mode, setMode] = useState(() =>
    supportsSimpleMode(initialValues, accounts)
      ? TransactionFormMode.SIMPLE
      : TransactionFormMode.BOOKINGS_TABLE
  );

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => onSubmit(normalizeValues(values))}
      validate={(values) => validate && validate(normalizeValues(values))}
      {...props}
    >
      <ModalBody title={title}>
        <div
          className={cn("mt-6", {
            "space-y-12": mode === TransactionFormMode.BOOKINGS_TABLE,
            "space-y-6": mode === TransactionFormMode.SIMPLE,
          })}
        >
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
            <Labeled htmlFor="date" label="Date" className="sm:col-span-3">
              <DatepickerInput name="date" id="date" format={dateFormat} />
            </Labeled>
            <Labeled htmlFor="note" label="Note" className="sm:col-span-9">
              <Input name="note" id="note" />
            </Labeled>
            {mode === TransactionFormMode.SIMPLE && (
              <SimpleModeFields accountId={accountId} />
            )}
          </div>
          {mode === TransactionFormMode.BOOKINGS_TABLE && (
            <BookingsPart accountId={accountId} />
          )}
          <div className="justify-between sm:flex sm:flex-row">
            <TransactionFormModeButton
              mode={mode}
              setMode={setMode}
              accountsById={accounts}
            />
            {mode === TransactionFormMode.BOOKINGS_TABLE && (
              <div className="space-y-3 sm:flex sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-3">
                <AddChargeButton />
                <AddDepositButton />
                <AddExpenseButton />
                <AddIncomeButton />
              </div>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter statusMessage={<FormErrorMessage />}>
        <SubmitButton className="w-full sm:w-auto">Save</SubmitButton>
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Form>
  );

  function normalizeValues(
    values: TransactionFormValues
  ): TransactionFormValues {
    if (mode === TransactionFormMode.BOOKINGS_TABLE) return values;

    return {
      ...values,
      bookings: [
        values.bookings[0],
        { ...values.bookings[1], amount: values.bookings[0].amount },
      ],
    };
  }
}

type InnerTransactionFormProps = TransactionFormProps & {
  accounts: Record<string, AccountDto>;
};

function AddDepositButton() {
  return (
    <AddBookingButton<SaveTransactionDepositDto>
      title="Add Deposit"
      values={{
        type: BookingType.DEPOSIT,
        note: "",
        amount: "",
        accountId: "",
      }}
    >
      Deposit
    </AddBookingButton>
  );
}

function AddExpenseButton() {
  return (
    <AddBookingButton<SaveTransactionExpenseDto>
      title="Add Expense"
      values={{
        type: BookingType.EXPENSE,
        note: "",
        amount: "",
        currency: "",
        expenseCategoryId: "",
      }}
    >
      Expense
    </AddBookingButton>
  );
}

function AddIncomeButton() {
  return (
    <AddBookingButton<SaveTransactionIncomeDto>
      title="Add Income"
      values={{
        type: BookingType.INCOME,
        note: "",
        amount: "",
        currency: "",
        incomeCategoryId: "",
      }}
    >
      Income
    </AddBookingButton>
  );
}

function SimpleModeFields({ accountId }: { accountId: string }) {
  const {
    values: { bookings },
  } = useFormikContext<TransactionFormValues>();

  const accountBookingIndex = bookings.findIndex(
    (b) => isChargeOrDeposit(b) && b.accountId === accountId
  );
  if (accountBookingIndex === -1)
    throw new Error(
      `Transaction does not have a booking for account ${accountId}`
    );

  const counterBookingIndex = accountBookingIndex === 1 ? 0 : 1;

  if (bookings[counterBookingIndex].type === BookingType.DEPOSIT) {
    return (
      <>
        <Labeled htmlFor="to" label="To" className="sm:col-span-9">
          <AccountSelect
            id="to"
            name={`bookings.${counterBookingIndex}.accountId`}
            showEmptyOption={true}
          />
        </Labeled>
        <Labeled htmlFor="amount" label="Amount" className="sm:col-span-3">
          <Input type="text" id="amount" name="bookings.0.amount" />
        </Labeled>
      </>
    );
  }

  if (bookings[counterBookingIndex].type === BookingType.CHARGE) {
    return (
      <>
        <Labeled htmlFor="from" label="From" className="sm:col-span-9">
          <AccountSelect
            id="from"
            name={`bookings.${counterBookingIndex}.accountId`}
            showEmptyOption={true}
          />
        </Labeled>
        <Labeled htmlFor="amount" label="Amount" className="sm:col-span-3">
          <Input type="text" id="amount" name="bookings.0.amount" />
        </Labeled>
      </>
    );
  }

  if (bookings[counterBookingIndex].type === BookingType.EXPENSE) {
    return (
      <>
        <Labeled
          htmlFor="expenseCategory"
          label="Expense Category"
          className="sm:col-span-9"
        >
          <ExpenseCategorySelect
            id="expenseCategory"
            name={`bookings.${counterBookingIndex}.expenseCategoryId`}
            showEmptyOption={true}
          />
        </Labeled>
        <Labeled htmlFor="amount" label="Amount" className="sm:col-span-3">
          <Input type="text" id="amount" name="bookings.0.amount" />
        </Labeled>
      </>
    );
  }

  return (
    <>
      <Labeled
        htmlFor="incomeCategory"
        label="Income Category"
        className="sm:col-span-9"
      >
        <IncomeCategorySelect
          id="incomeCategory"
          name={`bookings.${counterBookingIndex}.incomeCategoryId`}
          showEmptyOption={true}
        />
      </Labeled>
      <Labeled htmlFor="amount" label="Amount" className="sm:col-span-3">
        <Input type="text" id="amount" name="bookings.0.amount" />
      </Labeled>
    </>
  );
}

function TransactionFormModeButton({
  mode,
  setMode,
  accountsById,
}: SimpleModeButtonProps) {
  const { values } = useFormikContext<TransactionFormValues>();
  return (
    <Toggle
      value={mode === TransactionFormMode.BOOKINGS_TABLE}
      onSetValue={(value) => {
        setMode(
          value
            ? TransactionFormMode.BOOKINGS_TABLE
            : TransactionFormMode.SIMPLE
        );
      }}
      disabled={!supportsSimpleMode(values, accountsById)}
      id="simpleModeLabel"
    >
      Bookings Table
    </Toggle>
  );
}

interface SimpleModeButtonProps {
  mode: TransactionFormMode;
  setMode: (value: TransactionFormMode) => void;
  accountsById: Record<string, AccountDto>;
}

function supportsSimpleMode(
  values: TransactionFormValues,
  accounts: Record<string, AccountDto>
): boolean {
  if (values.bookings.length > 2) return false;

  if (!values.bookings.every(isChargeOrDeposit)) return true;
  if (!values.bookings.every((b) => !!b.accountId)) return true;

  const units = values.bookings.map((b) => accounts[b.accountId].unit);

  if (units[0].kind !== units[1].kind) return false;

  if (units.every(isCurrencyUnit) && units[0].currency !== units[1].currency)
    return false;

  return true;
}

enum TransactionFormMode {
  SIMPLE = "SIMPLE",
  BOOKINGS_TABLE = "BOOKINGS_TABLE",
}
