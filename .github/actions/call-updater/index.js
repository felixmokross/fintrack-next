import fetch from "node-fetch";

main().catch((e) => console.error(e));

async function main() {
  const token = await getToken();

  await fetchWithToken("/api/admin/update-forex-rates", "PUT", token);
  await fetchWithToken("/api/admin/update-stock-prices", "PUT", token);
  await fetchWithToken("/api/admin/recalculate", "PUT", token);
}

async function fetchWithToken(url, method, token) {
  const baseUrl = process.env.BASE_URL;

  console.log(`calling ${url}…`);
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });

  await ensureFetchSuccess(response);
}

async function getToken() {
  const tokenEndpoint = `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`;

  console.log("fetching token…");
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
      `Token request failed with status code ${
        response.status
      }: ${await response.text()}`
    );
}

function urlEncode(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}
