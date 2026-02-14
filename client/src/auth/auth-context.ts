import { createContext } from "react";
import type { UserDTO } from "@/types/dto";

export type AuthState = {
    user: UserDTO | null;
    isLoading: boolean;
    login: (p: { username: string; password: string }) => Promise<void>;
    register: (p: { username: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshMe: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);
