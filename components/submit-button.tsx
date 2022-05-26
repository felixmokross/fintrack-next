import { useFormikContext } from "formik";
import { PropsWithChildren } from "react";
import { Button, ButtonVariant } from "./button";

export default function SubmitButton({
  variant = ButtonVariant.PRIMARY,
  children,
  className,
}: PropsWithChildren<SubmitButtonProps>): React.ReactElement {
  const { isSubmitting, dirty, submitCount, isValid } = useFormikContext();
  return (
    <Button
      variant={variant}
      className={className}
      type="submit"
      disabled={isSubmitting || !dirty || (!!submitCount && !isValid)}
    >
      {children}
    </Button>
  );
}

export interface SubmitButtonProps {
  variant?: ButtonVariant;
  className?: string;
}
