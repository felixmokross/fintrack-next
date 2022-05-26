import { ReactElement } from "react";
import { ErrorMessage as FormikErrorMessage } from "formik";

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
