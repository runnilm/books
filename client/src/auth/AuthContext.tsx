import React, { useEffect, useMemo, useState } from "react";
import type { UserDTO } from "@/types/dto";
import { authApi } from "@/api/authApi";
import { AuthContext, type AuthState } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function refreshMe() {
        const res = await authApi.me();
        setUser(res.user);
    }

    useEffect(() => {
        (async () => {
            try {
                await refreshMe();
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    async function login(p: { username: string; password: string }) {
        const res = await authApi.login(p);
        setUser(res.user);
    }

    async function register(p: { username: string; password: string }) {
        const res = await authApi.register(p);
        setUser(res.user);
    }

    async function logout() {
        await authApi.logout();
        setUser(null);
    }

    const value: AuthState = useMemo(
        () => ({ user, isLoading, login, register, logout, refreshMe }),
        [user, isLoading],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
