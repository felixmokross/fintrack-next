import { ReactElement } from "react";
import { OptionsIcon } from "./icons";

export default function ActionsButton({
  className,
  onClick,
  id,
  ariaExpanded,
}: ActionsButtonProps): ReactElement {
  return (
    <button
      className={className}
      title="Actions"
      id={id}
      onClick={onClick}
      aria-haspopup="true"
      aria-expanded={ariaExpanded}
    >
      <div className="sr-only">Actions</div>
      <OptionsIcon className="h-5 w-5" />
    </button>
  );
}

export interface ActionsButtonProps {
  className?: string;
  onClick: () => void;
  id: string;
  ariaExpanded: boolean;
}
