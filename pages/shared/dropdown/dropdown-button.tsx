import { PropsWithChildren, ReactElement, useContext } from "react";
import { cn } from "../../../lib/classnames";
import { IconComponentType } from "../icons";
import DropdownContext from "./dropdown-context";

export function DropdownButton({
  children,
  icon: Icon,
  onClick,
  disabled = false,
}: PropsWithChildren<DropdownButtonProps>): ReactElement {
  const { dismissMenu } = useContext(DropdownContext);
  return (
    <button
      className={cn(
        "secondary-group flex w-full items-center px-4 py-2 text-sm text-gray-700 disabled:cursor-default disabled:opacity-50 dark:text-gray-200",
        disabled || "hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
      role="menuitem"
      onClick={() => {
        onClick && onClick();
        dismissMenu();
      }}
      disabled={disabled}
    >
      {Icon && (
        <Icon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-300" />
      )}
      <span className="text-left">{children}</span>
    </button>
  );
}

interface DropdownButtonProps {
  icon?: IconComponentType;
  onClick?: () => void;
  disabled?: boolean;
}
