import { cn } from "./classnames";

export function inputStyles(
  touched: boolean,
  error: string | undefined
): string {
  const hasError = touched && !!error;
  return cn(
    "shadow-sm block w-full sm:text-sm rounded-md disabled:opacity-50 bg-white dark:bg-gray-900",
    hasError
      ? "border-red-500 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:text-red-400 dark:placeholder-red-800 dark:focus:ring-red-600 dark:focus:border-red-600"
      : "border-gray-300 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 dark:text-gray-200 dark:border-gray-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
  );
}
