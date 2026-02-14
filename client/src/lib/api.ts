export type ApiError = { message: string; status?: number };

async function parseError(res: Response): Promise<ApiError> {
    let message = `Request failed (${res.status})`;
    try {
        const data = await res.json();
        if (typeof data?.message === "string") message = data.message;
    } catch {
        // ignore
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

    if (!res.ok) throw await parseError(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
}
