import {
  expressjwt as jwt,
  GetVerificationKey,
  Request,
  UnauthorizedError,
} from "express-jwt";
import jwksRsa from "jwks-rsa";
import { Response } from "express";
import { NextApiHandler } from "next";
import { recalculate } from "../../shared/recalculate.server";
import { getDb } from "../../shared/mongodb.server";
import { today } from "../../shared/today";

const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
if (!issuerBaseUrl) throw new Error("AUTH0_ISSUER_BASE_URL not set!");

const audience = process.env.AUTH0_API_AUDIENCE;
if (!audience) throw new Error("AUTH0_API_AUDIENCE not set!");

const adminApiTenantName = process.env.ADMIN_API_TENANT_NAME;
if (!adminApiTenantName) throw new Error("ADMIN_API_TENANT_NAME not set!");

const handleRecalculate: NextApiHandler = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      // need to forcibly cast to express Request and Response object, although they are compatible in our case
      checkJwt(
        req as unknown as Request,
        res as unknown as Response,
        (result) => {
          if (result instanceof Error) {
            return reject(result);
          }

          return resolve(result);
        }
      );
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ message: "unauthorized" });
      return;
    } else {
      throw error;
    }
  }

  if (req.method !== "PUT") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  const db = await getDb(adminApiTenantName);
  await recalculate(db, undefined, today().subtract(1, "day"));

  res.json({ message: "success" });
};

export default handleRecalculate;

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuerBaseUrl}/.well-known/jwks.json`,
  }) as GetVerificationKey,

  audience: audience,
  issuer: `${issuerBaseUrl}/`,
  algorithms: ["RS256"],
});
