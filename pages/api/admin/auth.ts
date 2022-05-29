import {
  expressjwt as jwt,
  GetVerificationKey,
  Request,
  UnauthorizedError,
} from "express-jwt";
import jwksRsa from "jwks-rsa";
import { NextApiHandler } from "next";
import { Response } from "express";

const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
if (!issuerBaseUrl) throw new Error("AUTH0_ISSUER_BASE_URL not set!");

const audience = process.env.AUTH0_API_AUDIENCE;
if (!audience) throw new Error("AUTH0_API_AUDIENCE not set!");

export function withAdminApiAuth<T>(
  handler: NextApiHandler<T>
): NextApiHandler<T> {
  return async (req, res) => {
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
        res.status(401).end();
        return;
      } else {
        throw error;
      }
    }

    return handler(req, res);
  };
}

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
