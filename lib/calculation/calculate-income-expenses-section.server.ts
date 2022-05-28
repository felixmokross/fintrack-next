import Decimal from "decimal.js-light";
import { flatten, groupBy } from "lodash";
import { BookingType } from "../../pages/shared/transactions/enums";
import {
  IncomeExpenseRefModel,
  IncomeExpensesSectionModel,
} from "../../pages/shared/periods/model.server";
import {
  BookingModel,
  ExpenseModel,
  IncomeModel,
  TransactionModel,
} from "../../pages/shared/transactions/model.server";
import { referenceCurrency, sum } from "../../pages/shared/util";
import { convertToCurrency, RateProvider } from "./forex-rates.server";

export function calculateIncomeExpensesSection<
  TBookingType extends IncomeExpenseBookingType
>(
  transactions: readonly TransactionModel[],
  bookingType: TBookingType,
  getCategoryId: (b: IncomeExpenseBookingModel<TBookingType>) => string,
  rateProvider: RateProvider
): IncomeExpensesSectionModel {
  const entries = Object.entries(
    groupBy(
      flatten(
        transactions.map((t) =>
          t.bookings
            .filter(isIncomeExpense)
            .map<[TransactionModel, IncomeExpenseBookingModel<TBookingType>]>(
              (b) => [t, b]
            )
        )
      ),
      ([, b]) => getCategoryId(b)
    )
  ).map<
    [string, { bookings: readonly IncomeExpenseRefModel[]; total: Decimal }]
  >(([categoryId, bookingsWithTransactions]) => {
    const bookings = bookingsWithTransactions.map<IncomeExpenseRefModel>(
      ([t, b]) => ({
        transactionId: t._id,
        date: t.date,
        transactionNote: t.note,
        bookingNote: b.note,
        currency: b.currency,
        amount: b.amount,
        amountInReferenceCurrency: convertToCurrency(
          b.amount,
          b.currency,
          referenceCurrency,
          t.date,
          rateProvider
        ),
      })
    );
    return [
      categoryId,
      {
        bookings,
        total: sum(bookings.map((b) => b.amountInReferenceCurrency)),
      },
    ];
  });

  return {
    categories: Object.fromEntries(entries),
    total: sum(entries.map(([, c]) => c.total)),
  };

  function isIncomeExpense(
    booking: BookingModel
  ): booking is IncomeExpenseBookingModel<TBookingType> {
    return booking.type === bookingType;
  }
}

type IncomeExpenseBookingType = BookingType.INCOME | BookingType.EXPENSE;
type IncomeExpenseBookingModel<TBookingType extends IncomeExpenseBookingType> =
  TBookingType extends BookingType.INCOME ? IncomeModel : ExpenseModel;
