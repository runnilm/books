import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const loc = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-[50vh] grid place-items-center">
                <div className="text-sm opacity-70">Loading…</div>
            </div>
        );
    }

    if (!user) {
        const next = encodeURIComponent(loc.pathname + loc.search);
        return <Navigate to={`/login?next=${next}`} replace />;
    }

    return <>{children}</>;
}
