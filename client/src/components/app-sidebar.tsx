import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, User } from "lucide-react";

import { useAuth } from "@/auth/auth";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="px-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link to="/app/books">
                                <BookOpen />
                                <span>Books</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith("/app/books")}
                        >
                            <Link to="/app/books">
                                <BookOpen />
                                <span>Browse</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith("/app/account")}
                        >
                            <Link to="/app/account">
                                <User />
                                <span>Account</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="px-2">
                <div className="flex items-center justify-between gap-2 rounded-md border px-2 py-2 text-sm">
                    <div className="min-w-0">
                        <div className="truncate font-medium">
                            {user?.username ?? "—"}
                        </div>
                        <div className="truncate text-xs opacity-70">
                            Signed in
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Log out"
                        onClick={async () => {
                            await logout();
                            navigate("/login", { replace: true });
                        }}
                    >
                        <LogOut className="size-4" />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
