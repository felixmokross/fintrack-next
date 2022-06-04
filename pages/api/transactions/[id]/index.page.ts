import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import dayjs from "dayjs";
import { recalculate } from "../../../shared/recalculate.server";
import { serializeId } from "../../../shared/serialization.server";
import { Transaction } from "../../../shared/transactions/documents.server";
import { isChargeOrDeposit } from "../../../shared/transactions/functions";
import { getTenantDb } from "../../../shared/util.server";

export default withApiAuthRequired(async function deleteTransaction(req, res) {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  if (!req.query.id || typeof req.query.id !== "string") {
    res.status(400).json({ message: "No id specified" });
    return;
  }

  const db = await getTenantDb(req, res);

  const { ok, value } = await db
    .collection<Transaction>("transactions")
    .findOneAndDelete({
      _id: serializeId(req.query.id),
    });

  if (!ok || !value) {
    res.status(404).end();
    return;
  }

  const accountIds = value.bookings
    .filter(isChargeOrDeposit)
    .map((b) => b.accountId);
  await recalculate(db, accountIds, dayjs.utc(value.date));

  res.status(200).end();
});
