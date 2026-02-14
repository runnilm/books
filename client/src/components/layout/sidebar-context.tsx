import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

type SidebarCtx = { collapsed: boolean; toggle: () => void };
const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const value = useMemo(
        () => ({ collapsed, toggle: () => setCollapsed((v) => !v) }),
        [collapsed],
    );
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSidebar() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
    return ctx;
}
