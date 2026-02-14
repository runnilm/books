import { useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/auth";
import { Button } from "@/components/ui/button";

export function AccountPage() {
    const { user, logout } = useAuth();
    const nav = useNavigate();

    return (
        <div className="mx-auto max-w-2xl">
            <h1 className="text-xl font-semibold">Account</h1>
            <p className="mt-2 text-sm opacity-70">
                Signed in as{" "}
                <span className="font-medium">{user?.username ?? "—"}</span>
            </p>

            <div className="mt-6">
                <Button
                    variant="destructive"
                    onClick={async () => {
                        await logout();
                        nav("/login", { replace: true });
                    }}
                >
                    Log out
                </Button>
            </div>
        </div>
    );
}
