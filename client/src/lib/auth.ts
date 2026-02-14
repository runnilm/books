import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import type { User } from "@/types/api";
import { API } from "@/lib/endpoints";

type MeResponse = { user: User | null };
type AuthResponse = { user: User };

export function useMe() {
    return useQuery({
        queryKey: qk.me,
        queryFn: () => apiFetch<MeResponse>(API.auth.me),
    });
}

export function useLogin() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: { username: string; password: string }) =>
            apiFetch<AuthResponse>(API.auth.login, {
                method: "POST",
                body: JSON.stringify(input),
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.me });
        },
    });
}

export function useRegister() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: { username: string; password: string }) =>
            apiFetch<AuthResponse>(API.auth.register, {
                method: "POST",
                body: JSON.stringify(input),
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.me });
        },
    });
}

export function useLogout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => apiFetch<void>(API.auth.logout, { method: "POST" }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.me });
            qc.clear();
        },
    });
}
