import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegister } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RegisterPage() {
    const nav = useNavigate();
    const loc = useLocation();

    const sp = new URLSearchParams(loc.search);
    const rawNext = sp.get("next") ?? "";
    const next = rawNext.startsWith("/app/") ? rawNext : "/app/books";

    const register = useRegister();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const getErrorMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        if (typeof err === "string") return err;
        if (typeof err === "object" && err && "message" in err) {
            return String((err as { message: unknown }).message);
        }
        return "Register failed";
    };

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        try {
            await register.mutateAsync({ username, password });
            toast.success("Account created");
            nav(next, { replace: true });
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Register</CardTitle>
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
                                autoComplete="new-password"
                            />
                        </div>
                        <Button
                            className="w-full"
                            type="submit"
                            disabled={register.isPending}
                        >
                            {register.isPending
                                ? "Creating…"
                                : "Create account"}
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Have an account?{" "}
                            <Link className="underline" to="/app/login">
                                Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
