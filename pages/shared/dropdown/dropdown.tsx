import {
  ComponentType,
  PropsWithChildren,
  ReactElement,
  useState,
} from "react";
import { cn } from "../../../lib/classnames";
import { DropdownChevron } from "../icons";
import DropdownContext from "./dropdown-context";
import { DropdownMenu, DropdownMenuSize } from "./dropdown-menu";

export default function Dropdown({
  children,
  label,
  title,
  id,
  menuSize = DropdownMenuSize.NORMAL,
  triggerButton: TriggerButton = DropdownTriggerButton,
  triggerButtonClassName,
  triggerButtonVariant = DropdownTriggerButtonVariant.SECONDARY,
  menuClassName,
}: PropsWithChildren<DropdownProps>): ReactElement {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <TriggerButton
        id={id}
        label={label}
        title={title}
        onClick={() => setShowMenu(true)}
        ariaExpanded={showMenu}
        className={triggerButtonClassName}
        variant={triggerButtonVariant}
      />
      {showMenu && (
        <DropdownContext.Provider
          value={{ dismissMenu: () => setShowMenu(false) }}
        >
          <DropdownMenu
            className={menuClassName || "mt-2"}
            onOverlayClick={() => setShowMenu(false)}
            ariaLabelledBy={id}
            size={menuSize}
          >
            {children}
          </DropdownMenu>
        </DropdownContext.Provider>
      )}
    </div>
  );
}

export interface DropdownProps {
  label?: string;
  title?: string;
  id: string;
  menuSize?: DropdownMenuSize;
  triggerButton?: ComponentType<DropdownTriggerButtonProps>;
  triggerButtonClassName?: string;
  triggerButtonVariant?: DropdownTriggerButtonVariant;
  menuClassName?: string;
}

function DropdownTriggerButton({
  id,
  title,
  ariaExpanded,
  onClick,
  label,
  variant,
}: DropdownTriggerButtonProps): ReactElement {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        id={id}
        title={title}
        aria-haspopup="true"
        aria-expanded={ariaExpanded}
        className={cn(
          "inline-flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
          {
            "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-700":
              variant === DropdownTriggerButtonVariant.SECONDARY,
            "border-transparent bg-blue-500 text-white hover:bg-blue-600":
              variant === DropdownTriggerButtonVariant.PRIMARY,
          }
        )}
      >
        {label}
        <DropdownChevron className="-mr-1 ml-2 h-5 w-5" />
      </button>
    </div>
  );
}

interface DropdownTriggerButtonProps {
  id: string;
  title?: string;
  ariaExpanded: boolean;
  onClick: () => void;
  label?: string;
  className?: string;
  variant: DropdownTriggerButtonVariant;
}

export enum DropdownTriggerButtonVariant {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
}
