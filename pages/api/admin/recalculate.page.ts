import { NextApiHandler } from "next";
import { recalculate } from "../../shared/recalculate.server";
import { today } from "../../shared/today";
import { withAdminApiAuth } from "./auth";
import { getAdminTenantDb } from "../../shared/util.server";

const handleRecalculate: NextApiHandler = withAdminApiAuth(async (req, res) => {
  if (req.method !== "PUT") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  const db = await getAdminTenantDb();
  await recalculate(db, undefined, today().subtract(7, "day"));

  res.json({ message: "success" });
});

export default handleRecalculate;
