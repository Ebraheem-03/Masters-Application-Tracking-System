import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Settings, 
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Applications', href: '/app/applications', icon: FileText },
  { name: 'Documents', href: '/app/documents', icon: FolderOpen },
  { name: 'Calendar', href: '/app/calendar', icon: Calendar },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-card border-r overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Navigation
          </div>
        </div>
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/app'}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm hover:scale-105'
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className="transition-all duration-200">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}