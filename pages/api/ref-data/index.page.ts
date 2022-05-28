import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import {
  Currency,
  toCurrencyDto,
} from "../../shared/currencies/documents.server";
import { getDb } from "../../shared/mongodb.server";
import { RefDataDto } from "../../shared/ref-data/dtos";
import { byKey } from "../../shared/util";

export default withApiAuthRequired(async function getRefData(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  const db = await getDb();

  const [currencies] = await Promise.all([getCurrencies()]);

  return res.json({ currencies } as RefDataDto);

  async function getCurrencies() {
    return byKey(
      (
        await db
          .collection<Currency>("currencies")
          .find({ blacklisted: false })
          .sort({ _id: 1 })
          .toArray()
      ).map(toCurrencyDto),
      (c) => c._id
    );
  }
});
