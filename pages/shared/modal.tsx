import { PropsWithChildren, ReactElement, ReactNode } from "react";
import { cn } from "../../lib/classnames";

export function Modal({
  size = ModalSize.MEDIUM,
  children,
}: PropsWithChildren<ModalProps>): React.ReactElement {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-800"></div>
        </div>
        <div
          className={cn(
            "inline-block transform rounded-lg border border-gray-100 bg-white text-left align-bottom shadow-xl transition-all dark:border-gray-700 dark:bg-gray-900 sm:my-8 sm:w-full sm:align-middle",
            {
              "sm:max-w-2xl": size === ModalSize.LARGE,
              "sm:max-w-xl": size === ModalSize.MEDIUM,
              "sm:max-w-sm": size === ModalSize.SMALL,
            }
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export interface ModalProps {
  size?: ModalSize;
}

export enum ModalSize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export function ModalBody({
  title,
  children,
}: PropsWithChildren<ModalBodyProps>): ReactElement {
  return (
    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className="mt-3 text-center sm:mt-0 sm:text-left">
        <h3 className="text-3xl font-light leading-10">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export interface ModalBodyProps {
  title: string;
}

export function ModalFooter({
  children,
  statusMessage,
}: PropsWithChildren<{ statusMessage?: ReactNode }>): ReactElement {
  return (
    <div className="rounded-b-lg bg-gray-50 px-4 py-3 dark:bg-gray-800 sm:flex sm:items-center sm:justify-between sm:px-6">
      <div>{statusMessage}</div>
      <div className="space-y-3 sm:flex sm:flex-row-reverse sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
        {children}
      </div>
    </div>
  );
}
