import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginPage() {
    const nav = useNavigate();
    const loc = useLocation();

    const sp = new URLSearchParams(loc.search);
    const rawNext = sp.get("next") ?? "";
    const from = rawNext.startsWith("/app/") ? rawNext : "/app/books";

    const login = useLogin();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const getErrorMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        if (typeof err === "string") return err;
        if (typeof err === "object" && err && "message" in err) {
            return String((err as { message: unknown }).message);
        }
        return "Login failed";
    };

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        try {
            await login.mutateAsync({ username, password });
            nav(from, { replace: true });
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={onSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="u">Username</Label>
                            <Input
                                id="u"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="p">Password</Label>
                            <Input
                                id="p"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                        <Button
                            className="w-full"
                            type="submit"
                            disabled={login.isPending}
                        >
                            {login.isPending ? "Signing in…" : "Sign in"}
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            No account?{" "}
                            <Link className="underline" to="/app/register">
                                Register
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
