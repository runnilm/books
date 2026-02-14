import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function AppShell() {
    return (
        <div className="min-h-dvh bg-background text-foreground">
            <SiteHeader />

            <div className="flex w-full gap-4 px-4 py-4">
                <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 lg:block">
                    <Sidebar />
                </aside>

                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
