import { ReactElement } from "react";
import { ErrorMessage as FormikErrorMessage, useFormikContext } from "formik";
import { FormValues } from "./types";

export function ErrorMessage({ name }: ErrorMessageProps): ReactElement {
  return (
    <FormikErrorMessage
      name={name}
      render={(error) => (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    />
  );
}

export interface ErrorMessageProps {
  name: string;
}

export function FormErrorMessage() {
  const { submitCount, errors } = useFormikContext<FormValues>();
  if (!submitCount || !errors.formError) return null;

  return (
    <p className="text-sm text-red-500 dark:text-red-400">{errors.formError}</p>
  );
}
