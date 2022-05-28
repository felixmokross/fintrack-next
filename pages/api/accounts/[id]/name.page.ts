import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Account } from "../../../accounts/shared/documents.server";
import { RenameAccountDto } from "../../../accounts/shared/dtos";
import { getDb } from "../../../shared/mongodb.server";
import { serializeId } from "../../../shared/serialization.server";

export default withApiAuthRequired(async function updateAccountName(req, res) {
  if (req.method !== "PUT") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  if (!req.query.id || typeof req.query.id !== "string") {
    res.status(400).json({ message: "No id specified" });
    return;
  }

  const dto = req.body as RenameAccountDto;
  const db = await getDb();

  const { matchedCount } = await db
    .collection<Account>("accounts")
    .updateOne(
      { _id: serializeId(req.query.id) },
      { $set: { name: dto.name } }
    );

  if (!matchedCount) {
    res.status(404).end();
    return;
  }

  res.status(200).end();
});
