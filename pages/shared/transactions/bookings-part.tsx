import { FieldArray, useFormikContext } from "formik";
import { CurrencySelect } from "../../accounts/shared/currency-select";
import { AccountSelect } from "../accounts/account-select";
import { Button, ButtonVariant } from "../button";
import { ExpenseCategorySelect } from "../expense-categories/expense-category-select";
import { Input } from "../forms/input";
import { IncomeCategorySelect } from "../income-categories/income-categories";
import { BookingType } from "./enums";
import {
  BookingFormValues,
  ChargeDepositFormValues,
  TransactionFormValues,
} from "./types";

export function BookingsPart({ accountId }: { accountId: string }) {
  const { values } = useFormikContext<TransactionFormValues>();
  return (
    <ul className="space-y-12">
      {values.bookings.map((bookingValues, index) => (
        <li key={index}>
          <BookingPart
            index={index}
            values={bookingValues}
            accountId={accountId}
          />
        </li>
      ))}
    </ul>
  );
}

function BookingPart({ index, values, accountId }: BookingPartProps) {
  switch (values.type) {
    case BookingType.CHARGE:
    case BookingType.DEPOSIT:
      return (
        <ChargeDepositBookingPart
          index={index}
          values={values}
          accountId={accountId}
        />
      );
    case BookingType.EXPENSE:
      return <ExpenseBookingPart index={index} />;
    case BookingType.INCOME:
      return <IncomeBookingPart index={index} />;
    default:
      throw new Error("Unsupported booking type");
  }
}

interface BookingPartProps {
  index: number;
  values: BookingFormValues;
  accountId: string;
}

function ChargeDepositBookingPart({
  index,
  values,
  accountId,
}: ChargeDepositBookingPartProps) {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
      <div>{values.type === BookingType.DEPOSIT ? "DPT" : "CHG"}</div>
      <div className="sm:col-span-7">
        <AccountSelect
          disabled={accountId === values.accountId}
          showEmptyOption={true}
          name={`bookings.${index}.accountId`}
          title="Account"
        />
      </div>

      <div className="sm:col-span-3">
        <Input
          name={`bookings.${index}.amount`}
          type="text"
          placeholder="Amount"
        />
      </div>

      <div>
        <RemoveBookingButton index={index} />
      </div>

      <div className="sm:col-span-7 sm:col-start-2">
        <Input name={`bookings.${index}.note`} type="text" placeholder="Note" />
      </div>
    </div>
  );
}

interface ChargeDepositBookingPartProps {
  index: number;
  values: ChargeDepositFormValues;
  accountId: string;
}

function ExpenseBookingPart({ index }: { index: number }) {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
      <div>EXP</div>

      <div className="sm:col-span-7">
        <ExpenseCategorySelect
          showEmptyOption={true}
          name={`bookings.${index}.expenseCategoryId`}
          title="Expense Category"
        />
      </div>

      <div className="sm:col-span-3">
        <Input
          name={`bookings.${index}.amount`}
          type="text"
          placeholder="Amount"
        />
      </div>

      <div>
        <RemoveBookingButton index={index} />
      </div>

      <div className="sm:col-span-7 sm:col-start-2">
        <Input name={`bookings.${index}.note`} type="text" placeholder="Note" />
      </div>

      <div className="sm:col-span-3">
        <CurrencySelect name={`bookings.${index}.currency`} />
      </div>
    </div>
  );
}

function IncomeBookingPart({ index }: { index: number }) {
  return (
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
      <div>INC</div>

      <div className="sm:col-span-7">
        <IncomeCategorySelect
          showEmptyOption={true}
          name={`bookings.${index}.incomeCategoryId`}
          title="Income Category"
        />
      </div>

      <div className="sm:col-span-3">
        <Input
          name={`bookings.${index}.amount`}
          type="text"
          placeholder="Amount"
        />
      </div>

      <div>
        <RemoveBookingButton index={index} />
      </div>

      <div className="sm:col-span-7 sm:col-start-2">
        <Input name={`bookings.${index}.note`} type="text" placeholder="Note" />
      </div>

      <div className="sm:col-span-3">
        <CurrencySelect name={`bookings.${index}.currency`} />
      </div>
    </div>
  );
}

function RemoveBookingButton({ index }: { index: number }) {
  return (
    <FieldArray name="bookings">
      {({ remove }) => (
        <Button
          title="Remove"
          variant={ButtonVariant.SECONDARY}
          onClick={() => remove(index)}
          disabled={index <= 1}
        >
          R
        </Button>
      )}
    </FieldArray>
  );
}
