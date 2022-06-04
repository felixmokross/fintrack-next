import { PropsWithChildren } from "react";
import { cn } from "./classnames";

export function Toggle({
  children,
  id,
  value,
  onSetValue: setValue,
  disabled = false,
}: PropsWithChildren<ToggleProps>) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => setValue(!value)}
        aria-pressed={value}
        aria-labelledby={id}
        disabled={disabled}
        className={cn(
          value ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-600",
          disabled && "cursor-default opacity-50",
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        <span className="sr-only">Activate</span>
        <span
          aria-hidden="true"
          className={cn(
            value ? "translate-x-5" : "translate-x-0",
            "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        ></span>
      </button>
      <span
        className={cn("ml-3 cursor-default", disabled && "opacity-50")}
        id={id}
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {children}
        </span>
      </span>
    </div>
  );
}

export interface ToggleProps {
  id: string;
  value: boolean;
  onSetValue: (v: boolean) => void;
  disabled?: boolean;
}
