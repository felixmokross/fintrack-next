import { ReactElement } from "react";
import { useField } from "formik";
import { cn } from "../lib/classnames";
import { inputStyles } from "../lib/input-styles";
import { ErrorMessage } from "./error-message";

export function Input({
    name,
    type = "text",
    className = "",
    disabled = false,
    ...props
}: InputProps): ReactElement {
    const [field, { touched, error }] = useField(name);
    return (
        <>
            <input
                {...props}
                className={cn(className, inputStyles(touched, error))}
                {...field}
                name={name}
                type={type}
                disabled={disabled}
            />
            <ErrorMessage name={name} />
        </>
    );
}

export type InputProps = {
    name: string;
    type?: string;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
