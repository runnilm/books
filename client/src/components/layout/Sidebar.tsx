import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, Library, User, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { useMe } from "@/lib/auth";

export function Sidebar() {
    const me = useMe();
    const isAdmin = Boolean(me.data?.user?.isAdmin);

    return (
        <nav className="flex w-60 flex-col gap-1">
            <Item to="/app/books" icon={<BookOpen className="h-4 w-4" />}>
                Books
            </Item>
            <Item to="/app/library" icon={<Library className="h-4 w-4" />}>
                My Library
            </Item>
            <Item to="/app/account" icon={<User className="h-4 w-4" />}>
                Account
            </Item>

            {isAdmin ? (
                <a
                    href="/admin/books"
                    className={cn(
                        "mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                    )}
                >
                    <Shield className="h-4 w-4" />
                    <span className="truncate">Admin</span>
                </a>
            ) : null}
        </nav>
    );
}

function Item({
    to,
    icon,
    children,
}: {
    to: string;
    icon: ReactNode;
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
                )
            }
        >
            {icon}
            <span className="truncate">{children}</span>
        </NavLink>
    );
}
