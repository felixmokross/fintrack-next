import { FieldArray } from "formik";
import { PropsWithChildren } from "react";
import { Button, ButtonVariant } from "../button";
import { SaveTransactionBookingDto } from "./dtos";

export function AddBookingButton<T extends SaveTransactionBookingDto>({
  title,
  values,
  children,
}: PropsWithChildren<AddBookingButtonProps<T>>) {
  return (
    <FieldArray name="bookings">
      {({ push }) => (
        <Button
          className="w-full sm:w-24"
          title={title}
          variant={ButtonVariant.SECONDARY}
          onClick={() => push(values)}
        >
          {children}
        </Button>
      )}
    </FieldArray>
  );
}

export interface AddBookingButtonProps<T extends SaveTransactionBookingDto> {
  title: string;
  values: T;
}
