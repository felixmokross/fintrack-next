import dayjs, { Dayjs } from "dayjs";
import { range } from "lodash";
import { useState } from "react";
import { today } from "../../../lib/today";

export function useDatepicker(
  initialDate?: Dayjs,
  onSetSelectedDate?: (date: Dayjs) => void
): DatepickerRenderData {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(
    (initialDate || today()).startOf("month")
  );

  return {
    currentMonthLabel: currentMonth.format("MMMM YYYY"),
    weekdayLabels: getWeekdayLabels(),
    dayButtons: getDayButtons(currentMonth, selectedDate, selectDay),
    showPreviousMonth,
    showNextMonth,
  };

  function showPreviousMonth() {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  }

  function showNextMonth() {
    setCurrentMonth(currentMonth.add(1, "month"));
  }

  function selectDay(newDate: Dayjs) {
    setSelectedDate(newDate);
    onSetSelectedDate && onSetSelectedDate(newDate);

    if (newDate.isBefore(currentMonth, "month")) showPreviousMonth();
    if (newDate.isAfter(currentMonth, "month")) showNextMonth();
  }
}

function getWeekdayLabels(): readonly string[] {
  const firstDayOfWeek = dayjs.localeData().firstDayOfWeek();
  return range(firstDayOfWeek, firstDayOfWeek + 7)
    .map((n) => n % 7)
    .map((weekday) => dayjs.weekdaysMin()[weekday]);
}

function getDayButtons(
  currentMonth: Dayjs,
  selectedDate: Dayjs | undefined,
  selectDay: (newDate: Dayjs) => void
): readonly DatepickerDayButton[] {
  return [
    ...getPreviousMonthDates(currentMonth).map((date) => ({
      date,
      isCurrentMonth: false,
    })),
    ...getCurrentMonthDates(currentMonth).map((date) => ({
      date,
      isCurrentMonth: true,
    })),
    ...getNextMonthDates(currentMonth).map((date) => ({
      date,
      isCurrentMonth: false,
    })),
  ].map((b) => ({
    isCurrentMonth: b.isCurrentMonth,
    label: b.date.date().toString(),
    isSelected: !!selectedDate && b.date.isSame(selectedDate, "day"),
    select: () => selectDay(b.date),
  }));
}

function getPreviousMonthDates(currentMonth: Dayjs): readonly Dayjs[] {
  const previousMonth = currentMonth.subtract(1, "month");
  const daysInPreviousMonth = previousMonth.daysInMonth();
  const currentMonthStartsOn = currentMonth.startOf("month").weekday();

  return range(
    daysInPreviousMonth - currentMonthStartsOn + 1,
    daysInPreviousMonth + 1
  ).map((day) => previousMonth.date(day));
}

function getCurrentMonthDates(currentMonth: Dayjs): readonly Dayjs[] {
  return range(1, currentMonth.daysInMonth() + 1).map((day) =>
    currentMonth.date(day)
  );
}

function getNextMonthDates(currentMonth: Dayjs): readonly Dayjs[] {
  const currentMonthStartsOn = currentMonth.startOf("month").weekday();

  return range(1, 43 - (currentMonth.daysInMonth() + currentMonthStartsOn)).map(
    (day) => currentMonth.add(1, "month").date(day)
  );
}

export interface DatepickerRenderData {
  currentMonthLabel: string;
  weekdayLabels: readonly string[];
  dayButtons: readonly DatepickerDayButton[];
  showPreviousMonth: () => void;
  showNextMonth: () => void;
}

export interface DatepickerDayButton {
  label: string;
  isCurrentMonth: boolean;
  isSelected: boolean;
  select: () => void;
}
