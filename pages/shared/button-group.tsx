import { PropsWithChildren, ReactElement } from "react";
import { cn } from "../../lib/classnames";

export function ButtonGroup({
  className,
  title,
  isActive = false,
  onClick,
  children,
}: PropsWithChildren<ButtonGroupProps>): ReactElement {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        className,
        "inline-block border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-500 dark:text-gray-200",
        isActive
          ? "bg-gray-100 dark:bg-gray-700"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
    >
      {children}
    </button>
  );
}

export interface ButtonGroupProps {
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
  title?: string;
}
