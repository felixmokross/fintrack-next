import dayjs from "dayjs";
import { FormikErrors } from "formik";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { useRefData } from "../ref-data-context";
import { CreateAccountDto } from "../shared/accounts/dtos";
import api from "../shared/api";
import { Button, ButtonVariant } from "../shared/button";
import { DatepickerInput } from "../shared/datepicker/datepicker-input";
import Form from "../shared/forms/form";
import { Input } from "../shared/forms/input";
import { Labeled } from "../shared/forms/labeled";
import SubmitButton from "../shared/forms/submit-button";
import { Modal, ModalBody, ModalFooter } from "../shared/modal";
import { dateFormat } from "../shared/util";
import { AccountCategorySelect } from "./shared/account-category-select";
import { CurrencySelect } from "./shared/currency-select";
import { AccountType, AccountUnitKind } from "./shared/enums";

export function NewAccountModal({
  onClose,
}: {
  onClose: () => void;
}): ReactElement {
  const { invalidateRefData } = useRefData();
  const { push } = useRouter();
  return (
    <Modal>
      <Form
        onSubmit={async (values) => {
          const accountId = await createAccount(values);

          onClose();

          invalidateRefData();
          push(`/accounts/${accountId}`);
        }}
        validate={validateNewAccountFormValues}
        initialValues={initialValues}
      >
        <ModalBody title="New Account">
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-12">
              <Labeled htmlFor="name" label="Name" className="sm:col-span-7">
                <Input name="name" id="name" />
              </Labeled>
              <Labeled
                htmlFor="category"
                label="Category"
                className="sm:col-span-5"
              >
                <AccountCategorySelect
                  id="category"
                  name="categoryId"
                  showEmptyOption={true}
                />
              </Labeled>
              <Labeled
                htmlFor="currency"
                label="Currency"
                className="sm:col-span-7"
              >
                <CurrencySelect
                  id="currency"
                  name="currency"
                  showEmptyOption={true}
                />
              </Labeled>
              <Labeled
                htmlFor="openingDate"
                label="Opening Date"
                className="sm:col-span-5 sm:col-start-8"
              >
                <DatepickerInput
                  id="openingDate"
                  name="openingDate"
                  format={dateFormat}
                />
              </Labeled>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <SubmitButton className="w-full sm:w-auto">Save</SubmitButton>
          <Button
            variant={ButtonVariant.SECONDARY}
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );

  async function createAccount(values: NewAccountFormValues): Promise<string> {
    return await api("/api/accounts", "POST", {
      name: values.name,
      type: AccountType.TRACKED,
      unit: { kind: AccountUnitKind.CURRENCY, currency: values.currency },
      categoryId: values.categoryId,
      openingDate: dayjs
        .utc(values.openingDate, dateFormat)
        .format("YYYY-MM-DD"),
    } as CreateAccountDto);
  }
}

const initialValues: NewAccountFormValues = {
  name: "",
  categoryId: "",
  currency: "",
  openingDate: "",
};

function validateNewAccountFormValues(
  values: NewAccountFormValues
): FormikErrors<NewAccountFormValues> {
  const errors: FormikErrors<NewAccountFormValues> = {};

  if (!values.name) errors.name = "Required";

  if (!values.categoryId) errors.categoryId = "Required";

  if (!values.currency) errors.currency = "Required";

  if (!values.openingDate) errors.openingDate = "Required";

  return errors;
}

interface NewAccountFormValues {
  name: string;
  categoryId: string;
  currency: string;
  openingDate: string;
}
