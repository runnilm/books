import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

import { useAuth } from "@/auth/auth";
import { HeaderBookSearch } from "@/components/HeaderBookSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

function HeaderUserMenu() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                    <User className="size-4" />
                    <span className="hidden sm:inline">
                        {user?.username ?? "Account"}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/app/account")}>
                    <User className="size-4" />
                    <span className="ml-2">Account</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={async () => {
                        await logout();
                        navigate("/login", { replace: true });
                    }}
                >
                    <LogOut className="size-4" />
                    <span className="ml-2">Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-14 items-center gap-3 px-4 md:px-6">
                <SidebarTrigger />
                <Link to="/app/books" className="font-semibold tracking-tight">
                    Books
                </Link>

                <div className="ml-auto flex items-center gap-2">
                    <HeaderBookSearch />
                    <ThemeToggle />
                    <HeaderUserMenu />
                </div>
            </div>
        </header>
    );
}
