import { BookingDto } from "../transactions/dtos";

export interface DayLedgerDto {
  _id: {
    accountId: string;
    date: string;
  };
  lines: readonly DayLedgerLineDto[];
  balance: string;
}

export interface DayLedgerLineDto {
  transactionId: string;
  note?: string;
  bookings: readonly BookingDto[];
  value: string;
}
