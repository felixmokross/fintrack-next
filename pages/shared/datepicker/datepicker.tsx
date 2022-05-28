import { PropsWithChildren, ReactElement } from "react";
import { Dayjs } from "dayjs";
import { useDatepicker, DatepickerDayButton } from "./use-datepicker";
import { cn } from "../classnames";
import { IconComponentType, NextMonthIcon, PreviousMonthIcon } from "../icons";

export function Datepicker({
  initialDate,
  onSetSelectedDate,
}: DatepickerProps): ReactElement {
  const {
    weekdayLabels,
    dayButtons,
    currentMonthLabel,
    showPreviousMonth,
    showNextMonth,
  } = useDatepicker(initialDate, onSetSelectedDate);
  return (
    <div className="cursor-default rounded-lg border border-gray-300 bg-white p-2 shadow-md dark:border-gray-500 dark:bg-gray-900">
      <div className="flex items-stretch justify-center">
        <SwitchMonthButton
          title="Previous Month"
          icon={PreviousMonthIcon}
          onClick={showPreviousMonth}
        />
        <div className="grow text-center text-sm font-medium">
          {currentMonthLabel}
        </div>
        <SwitchMonthButton
          title="Next Month"
          icon={NextMonthIcon}
          onClick={showNextMonth}
        />
      </div>
      <div
        className="mt-2 grid grid-cols-datepicker-days text-center"
        role="grid"
      >
        {weekdayLabels.map((weekdayLabel, i) => (
          <WeekdayLabel key={i}>{weekdayLabel}</WeekdayLabel>
        ))}
        {dayButtons.map((b, index) => (
          <DayButton key={index} day={b} />
        ))}
      </div>
    </div>
  );
}

export interface DatepickerProps {
  initialDate?: Dayjs;
  onSetSelectedDate?: (date: Dayjs) => void;
}

function SwitchMonthButton({
  title,
  icon: Icon,
  onClick,
}: SwitchMonthButton): ReactElement {
  return (
    <button
      className="flex w-8 justify-center text-gray-700 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-50"
      type="button"
      title={title}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

interface SwitchMonthButton {
  title: string;
  icon: IconComponentType;
  onClick: () => void;
}

function WeekdayLabel({ children }: PropsWithChildren<{}>): ReactElement {
  return (
    <div
      className="border-b border-gray-200 pb-1 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-600"
      role="gridcell"
    >
      {children}
    </div>
  );
}

function DayButton({ day }: { day: DatepickerDayButton }): ReactElement {
  return (
    <button
      role="gridcell"
      type="button"
      onClick={(e) => {
        e.preventDefault();
        day.select();
      }}
      className={cn(
        "h-10 rounded-md text-sm hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-gray-800",
        {
          "text-gray-600 dark:text-gray-300":
            day.isCurrentMonth && !day.isSelected,
          "text-gray-300 dark:text-gray-600":
            !day.isCurrentMonth && !day.isSelected,
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100":
            day.isSelected,
        }
      )}
    >
      {day.label}
    </button>
  );
}
