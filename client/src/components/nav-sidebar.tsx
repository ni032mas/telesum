import { NavLink } from "react-router-dom";
import { Settings, Shield, LayoutDashboard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/summaries", label: "Summaries", icon: FileText },
  { to: "/auth", label: "Auth", icon: Shield },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function NavSidebar() {
  return (
    <aside className="w-60 border-r border-sidebar-border bg-sidebar flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-foreground">Telesum</h1>
        <p className="text-xs text-muted-foreground">Telegram Chat Summary</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
