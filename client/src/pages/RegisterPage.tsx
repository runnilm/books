import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/auth";
import { ApiError } from "@/api/fetchJson";
import { getSearchParam } from "@/lib/query";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterPage() {
    const { register } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();

    const next = useMemo(
        () => getSearchParam(loc.search, "next") ?? "/app/books",
        [loc.search],
    );

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !password) {
            setError("Username and password are required.");
            return;
        }

        setIsSubmitting(true);
        try {
            await register({ username: username.trim(), password });
            nav(next, { replace: true });
        } catch (err) {
            if (err instanceof ApiError)
                setError(err.message || "Registration failed.");
            else setError("Registration failed.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-[60vh] grid place-items-center py-10">
            <div className="w-full max-w-sm rounded-xl border p-6">
                <h1 className="text-xl font-semibold">Register</h1>
                <p className="text-sm opacity-70 mt-1">Create a new account.</p>

                {error && (
                    <div className="mt-4">
                        <Alert title="Registration error" message={error} />
                    </div>
                )}

                <form className="mt-4 space-y-3" onSubmit={onSubmit}>
                    <div>
                        <label className="text-sm font-medium">Username</label>
                        <div className="mt-1">
                            <Input
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Password</label>
                        <div className="mt-1">
                            <Input
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating…" : "Create account"}
                    </Button>
                </form>

                <div className="mt-4 text-sm opacity-80">
                    Already have an account?{" "}
                    <Link
                        className="underline hover:opacity-100"
                        to={`/login?next=${encodeURIComponent(next)}`}
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
