import { last } from "lodash";

export default async function api<TResponse = void, TRequest = undefined>(
    url: string,
    method: ApiMethod = "GET",
    requestBody?: TRequest
): Promise<TResponse> {
    const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (response.status >= 400) {
        throw new Error(
            `Received status code ${response.status} (${
                response.statusText
            }) when calling ${method} ${url}. Response body: ${await response.text()}`
        );
    }

    if (method === "GET") return (await response.json()) as TResponse;

    if (response.status === 201) {
        const location = response.headers.get("Location");
        if (location) {
            return last(location.split("/")) as unknown as TResponse;
        }
    }

    return Promise.resolve() as unknown as TResponse;
}

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";
