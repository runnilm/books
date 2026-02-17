export type ApiError = { message: string; status?: number };

function defaultMessageForStatus(status: number): string {
    if (status === 400)
        return "That request didn't look right. Please try again.";
    if (status === 401)
        return "Your session has expired. Please sign in again.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 404) return "We couldn't find what you were looking for.";
    if (status === 409) return "That already exists. Try a different value.";
    if (status >= 500)
        return "Something went wrong on our side. Please try again.";
    return "Something went wrong. Please try again.";
}

function isAuthEndpoint(input: RequestInfo): boolean {
    const url =
        typeof input === "string"
            ? input
            : input instanceof Request
              ? input.url
              : "";

    return (
        url.includes("/api/auth/login") || url.includes("/api/auth/register")
    );
}

async function parseError(
    res: Response,
    input: RequestInfo,
): Promise<ApiError> {
    let message = defaultMessageForStatus(res.status);

    if (isAuthEndpoint(input) && (res.status === 401 || res.status === 400)) {
        message = "Invalid username or password.";
    }

    try {
        const data = await res.json();
        if (typeof data?.message === "string" && data.message.trim().length) {
            message = data.message;
        }
    } catch {
        try {
            const txt = (await res.text())?.trim();
            if (txt) message = txt;
        } catch {
            // ignore
        }
    }

    return { message, status: res.status };
}

export async function apiFetch<T>(
    input: RequestInfo,
    init?: RequestInit,
): Promise<T> {
    const res = await fetch(input, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) throw await parseError(res, input);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
}
