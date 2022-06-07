import core from "@actions/core";
import fetch from "node-fetch";

main().catch((e) => {
  console.error(e);
  core.setFailed(e);
});

async function main() {
  const token = await getToken();

  await callApi("/api/admin/update-forex-rates", "PUT", token);
  await callApi("/api/admin/update-stock-prices", "PUT", token);
  await callApi("/api/admin/recalculate", "PUT", token);
}

async function callApi(url, method, token) {
  console.log(`Calling ${url}…`);

  const response = await fetchWithRetries(url, method, token);
  await ensureFetchSuccess(response);
}

async function fetchWithRetries(url, method, token) {
  const maxNumberOfTries = 3;
  let response;
  for (let i = 0; i < maxNumberOfTries; i++) {
    if (i > 0) console.log(`Timeout, retrying (${i + 1}/${maxNumberOfTries})…`);

    response = await fetchWithToken(url, method, token);

    if (response.status !== 504) {
      return response;
    }
  }

  throw new Error(
    `Request failed ${maxNumberOfTries} times with timeout (HTTP status code 504). Last response message: ${await response.text()}`
  );
}

async function fetchWithToken(url, method, token) {
  const baseUrl = process.env.BASE_URL;

  return await fetch(`${baseUrl}${url}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function getToken() {
  const tokenEndpoint = `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`;

  console.log("Fetching token…");
  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: urlEncode({
      audience: process.env.AUTH0_API_AUDIENCE,
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
    }),
  });

  await ensureFetchSuccess(response);

  return (await response.json()).access_token;
}

async function ensureFetchSuccess(response) {
  if (response.status !== 200)
    throw new Error(
      `Request failed with status code ${
        response.status
      }: ${await response.text()}`
    );
}

function urlEncode(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}
