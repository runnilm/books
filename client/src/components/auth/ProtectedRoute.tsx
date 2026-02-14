import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "@/lib/auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const loc = useLocation();
    const me = useMe();

    if (me.isLoading)
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Loading session…
            </div>
        );

    if (!me.data?.user) {
        const next = `${loc.pathname}${loc.search}`;
        return (
            <Navigate
                to={`/app/login?next=${encodeURIComponent(next)}`}
                replace
            />
        );
    }

    return <>{children}</>;
}
