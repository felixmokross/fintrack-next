import { ReactElement } from "react";
import { dateFormat } from "../util";
import { DatepickerInput } from "../datepicker/datepicker-input";
import { SaveTransactionBookingDto, SaveTransactionDto } from "./dtos";
import { BookingType } from "./enums";
import Decimal from "decimal.js-light";
import dayjs from "dayjs";
import { FormikErrors } from "formik";
import { ModalBody, ModalFooter } from "../modal";
import { Labeled } from "../forms/labeled";
import Form from "../forms/form";
import { Input } from "../forms/input";
import SubmitButton from "../forms/submit-button";
import { Button, ButtonVariant } from "../button";
import { ValueChangeFormValues } from "./types";

export function ValueChangeForm({
  title,
  initialValues,
  onSubmit,
  onClose,
}: ValueChangeFormProps): ReactElement {
  return (
    <Form<ValueChangeFormValues>
      validate={validateValueChange}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      <ModalBody title={title}>
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
            <Labeled htmlFor="date" label="Date" className="sm:col-span-4">
              <DatepickerInput name="date" id="date" format={dateFormat} />
            </Labeled>
            <Labeled htmlFor="note" label="Note" className="sm:col-span-5">
              <Input name="note" id="note" />
            </Labeled>
            <Labeled
              htmlFor="valueChange"
              label="Change"
              className="sm:col-span-3"
            >
              <Input name="valueChange" id="valueChange" />
            </Labeled>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <SubmitButton
          variant={ButtonVariant.PRIMARY}
          className="w-full sm:w-auto"
        >
          Save
        </SubmitButton>
        <Button
          variant={ButtonVariant.SECONDARY}
          className="w-full sm:w-auto"
          onClick={onClose}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Form>
  );
}

export interface ValueChangeFormProps {
  title: string;
  initialValues: ValueChangeFormValues;
  onSubmit: (values: ValueChangeFormValues) => void | Promise<void>;
  onClose: () => void;
}

export function transformValueChangeFormValuesToSaveTransactionDto(
  values: ValueChangeFormValues,
  accountId: string
): SaveTransactionDto {
  return {
    date: dayjs.utc(values.date, dateFormat).format("YYYY-MM-DD"),
    note: values.note || null,
    bookings: getBookings(),
  };

  function getBookings(): [
    SaveTransactionBookingDto,
    SaveTransactionBookingDto
  ] {
    const valueChangeDecimal = new Decimal(values.valueChange);
    if (valueChangeDecimal.isPositive()) {
      return [
        { type: BookingType.APPRECIATION, amount: values.valueChange },
        {
          type: BookingType.DEPOSIT,
          accountId,
          amount: values.valueChange,
          note: null,
        },
      ];
    }

    const amount = valueChangeDecimal.negated().toString();
    return [
      { type: BookingType.DEPRECIATION, amount },
      { type: BookingType.CHARGE, accountId, amount, note: null },
    ];
  }
}

function validateValueChange(
  values: ValueChangeFormValues
): FormikErrors<ValueChangeFormValues> {
  const errors: FormikErrors<ValueChangeFormValues> = {};

  if (!values.date) errors.date = "Required";

  if (!values.valueChange) errors.valueChange = "Required";
  else if (!isValidDecimal(values.valueChange))
    errors.valueChange = "Must be a decimal";
  else if (new Decimal(values.valueChange).isZero())
    errors.valueChange = "Must not be zero";

  return errors;
}

function isValidDecimal(value: string): boolean {
  try {
    new Decimal(value);
    return true;
  } catch (e) {
    return false;
  }
}
