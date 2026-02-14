import { fetchJson } from "./fetchJson";
import type { AuthResponse, MeResponse } from "../types/dto";

export const authApi = {
    me() {
        return fetchJson<MeResponse>("/api/auth/me");
    },
    login(payload: { username: string; password: string }) {
        return fetchJson<AuthResponse>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    register(payload: { username: string; password: string }) {
        return fetchJson<AuthResponse>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    },
    logout() {
        return fetchJson<void>("/api/auth/logout", { method: "POST" });
    },
};
