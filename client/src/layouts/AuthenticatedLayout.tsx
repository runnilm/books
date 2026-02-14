import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AuthenticatedLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="min-h-screen">
                <SiteHeader />
                <main className="flex-1 px-4 py-6 md:px-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
