import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import dayjs from "dayjs";
import { recalculate } from "../../../lib/calculation/recalculate.server";
import { Transaction } from "../../shared/transactions/documents.server";
import { Account } from "../../shared/accounts/documents.server";
import { SaveTransactionDto } from "../../shared/transactions/dtos";
import { toBooking } from "../../../lib/mappings.server";
import { getDb } from "../../shared/mongodb.server";
import { serializeId } from "../../../lib/serialization.server";
import { isChargeOrDeposit } from "../../shared/transactions/functions";

export default withApiAuthRequired(async function createTransaction(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  const dto = req.body as SaveTransactionDto;
  const accountIds = dto.bookings
    .filter(isChargeOrDeposit)
    .map((b) => serializeId(b.accountId));

  const db = await getDb();
  const accounts = await db
    .collection<Account>("accounts")
    .find({ _id: { $in: accountIds } })
    .toArray();
  if (accounts.length !== accountIds.length)
    throw new Error("Not all accounts exist!");

  const transactionDate = dayjs.utc(dto.date);
  const { insertedId } = await db
    .collection<Transaction>("transactions")
    .insertOne({
      date: transactionDate.toDate(),
      note: dto.note,
      bookings: dto.bookings.map((b) => toBooking(b, accounts)),
    });

  await recalculate(db, accountIds, transactionDate);

  res
    .setHeader("Location", `/api/transactions/${insertedId}`)
    .status(201)
    .end();
});
