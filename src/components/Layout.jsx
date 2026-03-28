import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, UtensilsCrossed, ShoppingCart, 
  ChefHat, BarChart3, Grid3X3, Menu, X 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/menu", label: "Menu", icon: UtensilsCrossed },
  { path: "/orders", label: "Orders", icon: ShoppingCart },
  { path: "/new-order", label: "New Order", icon: ShoppingCart },
  { path: "/kitchen", label: "Kitchen", icon: ChefHat },
  { path: "/tables", label: "Tables", icon: Grid3X3 },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="font-heading text-2xl font-bold text-sidebar-primary">
            Savora
          </h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1 tracking-wider uppercase">
            Restaurant System
          </p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="px-4 py-2 text-xs text-sidebar-foreground/40">
            © 2026 Savora
          </div>
        </div>
      </aside>

      {/* Mobile Header + Overlay */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
          <h1 className="font-heading text-xl font-bold text-primary">Savora</h1>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-secondary">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
            <div className="w-64 h-full bg-sidebar text-sidebar-foreground" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-sidebar-border">
                <h1 className="font-heading text-2xl font-bold text-sidebar-primary">Savora</h1>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}