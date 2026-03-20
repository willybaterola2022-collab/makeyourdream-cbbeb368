import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { MobileMenu } from "./MobileMenu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-10 items-center justify-between border-b border-border/20 px-4 shrink-0 bg-background/60 backdrop-blur-lg z-40 sticky top-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">MK</AvatarFallback>
            </Avatar>
          </header>

          {/* Main content — add bottom padding on mobile for bottom nav */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />

        {/* Mobile hamburger menu */}
        <MobileMenu />
      </div>
    </SidebarProvider>
  );
}
