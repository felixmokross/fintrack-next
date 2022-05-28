import { TransactionModel } from "../../pages/shared/transactions/model.server";
import { isChargeOrDeposit } from "../../pages/shared/transactions/functions";

export function getTransactionsByAccountId(
  transactions: readonly TransactionModel[]
): Record<string, readonly TransactionModel[]> {
  return transactions.reduce<Record<string, TransactionModel[]>>(
    (acc, curr) => {
      const bookings = curr.bookings.filter(isChargeOrDeposit);
      for (const booking of bookings) {
        if (!acc[booking.accountId]) {
          acc[booking.accountId] = [];
        }

        acc[booking.accountId].push(curr);
      }

      return acc;
    },
    {}
  );
}
