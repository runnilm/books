import { useNavigate } from "react-router-dom";
import { useLogout, useMe } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function AccountPage() {
    const me = useMe();
    const logout = useLogout();
    const nav = useNavigate();

    return (
        <Card>
            <CardContent className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                    Signed in as{" "}
                    <span className="font-medium text-foreground">
                        {me.data?.user?.username}
                    </span>
                </div>
                <Button
                    variant="destructive"
                    disabled={logout.isPending}
                    onClick={async () => {
                        await logout.mutateAsync();
                        toast.success("Logged out");
                        nav("/app/login", { replace: true });
                    }}
                >
                    {logout.isPending ? "Logging out…" : "Logout"}
                </Button>
            </CardContent>
        </Card>
    );
}
