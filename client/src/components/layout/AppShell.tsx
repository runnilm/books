import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import {
    SidebarProvider,
    useSidebar,
} from "@/components/layout/sidebar-context";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { cn } from "@/lib/utils";

function ShellLayout() {
    const { collapsed } = useSidebar();

    return (
        <div className="min-h-dvh bg-background text-foreground">
            <SiteHeader />

            <div className="mx-auto flex w-full max-w-7xl gap-4 px-4 py-4">
                <aside
                    className={cn(
                        "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 lg:block",
                        collapsed ? "w-14" : "w-60",
                    )}
                >
                    <Sidebar />
                </aside>

                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export function AppShell() {
    return (
        <SidebarProvider>
            <ShellLayout />
        </SidebarProvider>
    );
}
