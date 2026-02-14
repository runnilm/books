export type ApiErrorShape = {
    status: number;
    message: string;
    details?: unknown;
};

export class ApiError extends Error implements ApiErrorShape {
    status: number;
    details?: unknown;

    constructor(status: number, message: string, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
    }
}

export async function fetchJson<T>(
    input: RequestInfo | URL,
    init: RequestInit = {},
): Promise<T> {
    const res = await fetch(input, {
        ...init,
        credentials: "include",
        headers: {
            ...(init.body ? { "Content-Type": "application/json" } : {}),
            ...(init.headers ?? {}),
        },
    });

    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!res.ok) {
        let message = res.statusText || "Request failed";
        let details: unknown = undefined;

        if (isJson) {
            try {
                const body = await res.json();
                message =
                    typeof body?.message === "string"
                        ? body.message
                        : typeof body?.error === "string"
                          ? body.error
                          : message;
                details = body;
            } catch {
                // ignore parse errors
            }
        }

        throw new ApiError(res.status, message, details);
    }

    if (res.status === 204) return undefined as T;

    if (isJson) return (await res.json()) as T;

    // fallback for text
    return (await res.text()) as unknown as T;
}
