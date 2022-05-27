import { PropsWithChildren } from "react";
import { Formik, FormikErrors } from "formik";

export default function Form<TValues>({
  initialValues,
  validate,
  onSubmit,
  children,
}: PropsWithChildren<FormProps<TValues>>) {
  return (
    <Formik<TValues>
      initialValues={initialValues}
      validate={validate}
      onSubmit={(values) => onSubmit(values)}
    >
      {({ handleSubmit }) => <form onSubmit={handleSubmit}>{children}</form>}
    </Formik>
  );
}

export interface FormProps<TValues> {
  initialValues: TValues;
  validate?: (
    values: TValues
  ) => void | FormikErrors<TValues> | Promise<FormikErrors<TValues>>;
  onSubmit: (values: TValues) => void | Promise<void>;
}
