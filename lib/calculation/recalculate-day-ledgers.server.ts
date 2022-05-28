import { Dayjs } from "dayjs";
import { Db, Filter } from "mongodb";
import {
  DayLedger,
  serializeDayLedger,
} from "../../pages/shared/day-ledgers/documents.server";
import { DayBalancesModel } from "../../pages/shared/balances/model.server";
import { DayLedgerModel } from "../../pages/shared/day-ledgers/model.server";
import { TransactionModel } from "../../pages/shared/transactions/model.server";
import { AccountModel } from "../../pages/shared/accounts/model.server";
import {
  serializeDate,
  serializeId,
} from "../../pages/shared/serialization.server";
import calculateNewDayLedgers from "./calculate-new-day-ledgers.server";
import { getTransactionsByAccountId } from "./transactions-by-account.server";

export default async function recalculateDayLedgers(
  db: Db,
  newTransactions: readonly TransactionModel[],
  baseDayBalances: DayBalancesModel,
  accountsById: Record<string, AccountModel>,
  accountIds?: readonly string[],
  startDate?: Dayjs
): Promise<void> {
  const newTransactionsByAccountId =
    getTransactionsByAccountId(newTransactions);

  const accounts = accountIds
    ? accountIds.map((id) => accountsById[id])
    : Object.values(accountsById);

  let dayLedgers: readonly DayLedgerModel[] = [];
  for (const account of accounts) {
    dayLedgers = dayLedgers.concat(
      calculateNewDayLedgers(
        account,
        newTransactionsByAccountId[account._id] || [],
        baseDayBalances.byAccount[account._id]?.balanceInAccountCurrency
      )
    );
  }

  console.log(`${dayLedgers.length} day ledgers to be created`);

  await deleteDayLedgers(accountIds, startDate);
  await storeDayLedgers(dayLedgers);

  async function deleteDayLedgers(
    accountIds?: readonly string[],
    startDate?: Dayjs
  ) {
    const conditions: Filter<DayLedger>[] = [
      ...(accountIds
        ? [{ "_id.accountId": { $in: accountIds.map(serializeId) } }]
        : []),
      ...(startDate
        ? [{ "_id.date": { $gte: serializeDate(startDate) } }]
        : []),
    ];
    return await db
      .collection<DayLedger>("dayLedgers")
      .deleteMany(conditions.length > 0 ? { $and: conditions } : {});
  }

  async function storeDayLedgers(dayLedgers: readonly DayLedgerModel[]) {
    if (dayLedgers.length === 0) return;

    return await db
      .collection<DayLedger>("dayLedgers")
      .insertMany(dayLedgers.map(serializeDayLedger));
  }
}
