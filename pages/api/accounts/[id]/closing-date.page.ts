import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import dayjs from "dayjs";
import { Account } from "../../../shared/accounts/documents.server";
import { AccountClosingDateDto } from "../../../shared/accounts/dtos";
import { getDb } from "../../../../lib/mongodb.server";
import { serializeId } from "../../../../lib/serialization.server";

export default withApiAuthRequired(async function updateClosingDate(req, res) {
  if (req.method !== "PUT") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  if (!req.query.id || typeof req.query.id !== "string") {
    res.status(400).json({ message: "No id specified" });
    return;
  }

  const dto = req.body as AccountClosingDateDto;
  const db = await getDb();

  const { matchedCount } = await db
    .collection<Account>("accounts")
    .updateOne(
      { _id: serializeId(req.query.id) },
      dto.closingDate
        ? { $set: { closingDate: dayjs.utc(dto.closingDate).toDate() } }
        : { $unset: { closingDate: "" } }
    );

  if (!matchedCount) {
    res.status(404).end();
    return;
  }

  res.status(200).end();
});
