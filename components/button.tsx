import { PropsWithChildren } from "react";
import { cn } from "../lib/classnames";

export enum ButtonVariant {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
  DANGER = "DANGER",
}

export function Button({
  type = "button",
  disabled = false,
  variant = ButtonVariant.PRIMARY,
  children,
  className,
  ...props
}: PropsWithChildren<ButtonProps>): React.ReactElement {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        "inline-flex justify-center rounded-md border px-4 py-2 text-sm font-medium disabled:cursor-default disabled:opacity-50",
        {
          "border-transparent bg-blue-500 text-white":
            variant === ButtonVariant.PRIMARY,
          "hover:bg-blue-600": variant === ButtonVariant.PRIMARY && !disabled,

          "border-gray-300 text-gray-700 dark:border-gray-500 dark:text-gray-200":
            variant === ButtonVariant.SECONDARY,
          "hover:bg-gray-100 dark:hover:bg-gray-700":
            variant === ButtonVariant.SECONDARY && !disabled,

          "border-transparent bg-red-500 text-white":
            variant === ButtonVariant.DANGER,
          "hover:bg-red-600": variant === ButtonVariant.DANGER && !disabled,
        },
        className
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export type ButtonProps = {
  variant?: ButtonVariant;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;
