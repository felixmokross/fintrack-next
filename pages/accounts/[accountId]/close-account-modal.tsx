import dayjs from "dayjs";
import { FormikErrors } from "formik";
import { ReactElement } from "react";
import { DatepickerInput } from "../../shared/datepicker/datepicker-input";
import { dateFormat } from "../../shared/util";
import { Modal, ModalBody, ModalFooter, ModalSize } from "../../shared/modal";
import Form from "../../shared/forms/form";
import SubmitButton from "../../shared/forms/submit-button";
import { Button, ButtonVariant } from "../../shared/button";
import { useReload } from "../../shared/reload";
import api from "../../shared/api";

export default function CloseAccountModal({
  accountId,
  onClose,
}: CloseAccountModalProps): ReactElement {
  const reload = useReload();
  return (
    <Modal size={ModalSize.SMALL}>
      <Form<CloseAccountFormValues>
        onSubmit={onSubmit}
        validate={validate}
        initialValues={{ date: "" }}
      >
        <ModalBody title="Close Account">
          <div className="mt-2">
            <label className="mt-6 text-sm text-gray-500" htmlFor="date">
              Please enter the date by which the account is closed:
            </label>
          </div>
          <div className="my-6 w-40">
            <DatepickerInput name="date" id="date" format={dateFormat} />
          </div>
        </ModalBody>
        <ModalFooter>
          <SubmitButton
            className="w-full sm:w-auto"
            variant={ButtonVariant.DANGER}
          >
            Close
          </SubmitButton>
          <Button
            className="w-full sm:w-auto"
            variant={ButtonVariant.SECONDARY}
            onClick={onClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );

  async function onSubmit(values: CloseAccountFormValues) {
    await api(`/api/accounts/${accountId}/closing-date`, "PUT", {
      closingDate: dayjs.utc(values.date, dateFormat).format("YYYY-MM-DD"),
    });

    onClose();

    reload();
  }
}

export interface CloseAccountModalProps {
  accountId: string;
  onClose: () => void;
}

interface CloseAccountFormValues {
  date: string;
}

function validate(
  values: CloseAccountFormValues
): FormikErrors<CloseAccountFormValues> {
  const errors: FormikErrors<CloseAccountFormValues> = {};

  if (!values.date) errors.date = "Required";
  else if (!dayjs.utc(values.date, dateFormat).isValid())
    errors.date = "Must be a valid date";

  return errors;
}
