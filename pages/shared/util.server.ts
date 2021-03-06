import { getSession } from "@auth0/nextjs-auth0";
import { IncomingMessage, ServerResponse } from "http";
import { getDb } from "./mongodb.server";

const tenantNameClaimKey = "https://fintrack-next.vercel.app/tenant_name";

export async function getTenantDb(req: IncomingMessage, res: ServerResponse) {
  const session = getSession(req, res);
  if (!session) throw new Error("Must be logged in!");

  const tenantName = session.user[tenantNameClaimKey];
  if (!tenantName) throw new Error("User must have tenantName claim!");

  return await getDb(tenantName);
}

export async function getAdminTenantDb() {
  const adminApiTenantName = process.env.ADMIN_API_TENANT_NAME;
  if (!adminApiTenantName) throw new Error("ADMIN_API_TENANT_NAME not set!");

  return await getDb(adminApiTenantName);
}
