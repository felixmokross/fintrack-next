import { PropsWithChildren, ReactElement, ReactNode } from "react";

export function Labeled({ children, label, htmlFor, className }: PropsWithChildren<LabeledProps>): ReactElement {
    return (
        <div className={className}>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="mt-1">{children}</div>
        </div>
    );
}

export interface LabeledProps {
    label: ReactNode;
    htmlFor: string;
    className?: string;
}
