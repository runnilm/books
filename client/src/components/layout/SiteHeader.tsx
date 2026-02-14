import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useSidebar } from "./sidebar-context";
import { BookCommand } from "../books/BookCommand";
import { PanelLeft } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLogout, useMe } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export function SiteHeader() {
    const { toggle } = useSidebar();
    const me = useMe();
    const logout = useLogout();
    const nav = useNavigate();

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="flex h-14 w-full items-center gap-3 px-4">
                {/* Left */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    aria-label="Toggle sidebar"
                >
                    <PanelLeft className="h-5 w-5" />
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* Center */}
                <div className="flex min-w-0 flex-1 justify-center">
                    <div className="w-full max-w-2xl">
                        <BookCommand />
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="px-2">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback>
                                        {(
                                            me.data?.user?.username?.[0] ?? "U"
                                        ).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => nav("/app/account")}
                            >
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={async () => {
                                    await logout.mutateAsync();
                                    nav("/app/login", { replace: true });
                                }}
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
