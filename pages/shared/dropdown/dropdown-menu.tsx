import { PropsWithChildren } from "react";
import { cn } from "../../../lib/classnames";

export function DropdownMenu({
  children,
  onOverlayClick,
  ariaLabelledBy,
  className,
  size = DropdownMenuSize.NORMAL,
}: PropsWithChildren<DropdownMenuProps>) {
  return (
    <>
      <Overlay onClick={onOverlayClick} />
      <div
        role="menu"
        className={cn(
          className,
          "absolute z-20 rounded-md border border-gray-300 bg-white py-1 shadow-lg dark:border-gray-500 dark:bg-gray-900",
          {
            "w-56": size === DropdownMenuSize.NORMAL,
            "w-96": size === DropdownMenuSize.LARGE,
          }
        )}
        aria-orientation="vertical"
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </div>
    </>
  );
}

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="fixed inset-0 z-10 h-full w-full cursor-default"
      data-testid="dropdown-menu-overlay"
      onClick={onClick}
    />
  );
}

export interface DropdownMenuProps {
  className?: string;
  onOverlayClick: () => void;
  ariaLabelledBy: string;
  size?: DropdownMenuSize;
}

export enum DropdownMenuSize {
  NORMAL = "NORMAL",
  LARGE = "LARGE",
}
