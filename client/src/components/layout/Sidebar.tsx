import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, User } from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";
import type { ReactNode } from "react";

export function Sidebar() {
    const { collapsed } = useSidebar();
    return (
        <nav className={cn("flex flex-col gap-1", collapsed ? "w-14" : "w-60")}>
            <Item
                to="/app/books"
                icon={<BookOpen className="h-4 w-4" />}
                collapsed={collapsed}
            >
                Books
            </Item>
            <Item
                to="/app/account"
                icon={<User className="h-4 w-4" />}
                collapsed={collapsed}
            >
                Account
            </Item>
        </nav>
    );
}

function Item({
    to,
    icon,
    collapsed,
    children,
}: {
    to: string;
    icon: ReactNode;
    collapsed: boolean;
    children: ReactNode;
}) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground",
                    collapsed && "justify-center px-2",
                )
            }
        >
            {icon}
            {!collapsed && <span className="truncate">{children}</span>}
        </NavLink>
    );
}
