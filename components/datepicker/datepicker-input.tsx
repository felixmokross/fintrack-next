import { ReactElement, useState } from "react";
import { Datepicker, DatepickerProps } from "./datepicker";
import { useField } from "formik";
import dayjs from "dayjs";
import { CalendarIcon } from "../icons";
import { cn } from "../../lib/classnames";
import { ErrorMessage } from "../error-message";
import { inputStyles } from "../../lib/input-styles";

export function DatepickerInput({
  name,
  format,
  disabled = false,
  ...props
}: DatepickerInputProps): ReactElement {
  const [field, , { setValue }] = useField(name);
  const [isOpen, setIsOpen] = useState(false);

  const parsedValue = dayjs.utc(field.value, format);
  return (
    <>
      <InputWithCalendarIcon
        {...props}
        {...field}
        onChange={(e) => setValue(e.currentTarget.value)}
        onClick={() => setIsOpen(true)}
        onBlur={(e) => {
          setIsOpen(false);
          field.onBlur(e);
        }}
        disabled={disabled}
      />
      {isOpen && (
        <DatepickerDropdown
          initialDate={parsedValue.isValid() ? parsedValue : undefined}
          onSetSelectedDate={(date) => {
            setValue(date.format(format));
            setIsOpen(false);
          }}
          onOverlayClick={() => setIsOpen(false)}
        />
      )}
      <ErrorMessage name={name} />
    </>
  );
}

export type DatepickerInputProps = {
  name: string;
  format: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

function InputWithCalendarIcon({
  name,
  disabled,
  ...props
}: InputWithCalendarIconProps): ReactElement {
  const [, { touched, error }] = useField(name);
  return (
    <div className="relative">
      <input
        {...props}
        name={name}
        disabled={disabled}
        type="text"
        className={cn("pr-10", inputStyles(touched, error))}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <CalendarIcon
          className={cn("h-5 w-5 text-gray-400", disabled && "opacity-50")}
        />
      </div>
    </div>
  );
}

type InputWithCalendarIconProps = { name: string } & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

function DatepickerDropdown({
  onOverlayClick,
  ...props
}: DatepickerDropdownProps): ReactElement {
  return (
    <div onMouseDown={(e) => e.preventDefault()}>
      <Overlay onClick={onOverlayClick} />
      <div role="dialog" className="relative">
        <div className="absolute z-20 mt-2">
          <Datepicker {...props} />
        </div>
      </div>
    </div>
  );
}

type DatepickerDropdownProps = { onOverlayClick: () => void } & DatepickerProps;

// TODO fix: Datepicker and modal overlay somehow work differently and datepicker overlay somehow is restricted to modal dialog and thus is not catching mouse events outside
function Overlay({ onClick }: { onClick: () => void }): ReactElement {
  return (
    <button
      data-testid="datepicker-overlay"
      type="button"
      tabIndex={-1}
      className="fixed inset-0 z-10 h-full w-full cursor-default"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    />
  );
}
