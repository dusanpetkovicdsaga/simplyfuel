import { Link, useLocation } from "@tanstack/react-router";
import { Home, BarChart2, History, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { onLogMeal: () => void };

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/progress", label: "Progress", icon: BarChart2 },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav({ onLogMeal }: Props) {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.slice(0, 2).map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
        <div className="flex items-center justify-center">
          <button
            onClick={onLogMeal}
            aria-label="Log meal"
            className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-float)] transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>
        {items.slice(2).map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
