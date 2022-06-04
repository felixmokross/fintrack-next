import { useField } from "formik";
import { cn } from "../classnames";
import { ErrorMessage } from "./error-message";
import { inputStyles } from "./input-styles";

export function Select({
  name,
  showEmptyOption = false,
  className = "",
  disabled = false,
  children,
  ...props
}: SelectProps) {
  const [field, { touched, error }] = useField(name);
  return (
    <>
      <select
        {...props}
        className={cn(className, inputStyles(touched, error))}
        {...field}
        name={name}
        disabled={disabled}
      >
        {showEmptyOption && <option />}
        {children}
      </select>
      <ErrorMessage name={name} />
    </>
  );
}

export type SelectProps = {
  name: string;
  showEmptyOption?: boolean;
} & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;
