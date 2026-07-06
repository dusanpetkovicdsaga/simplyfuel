import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { LogMealModal } from "@/components/log-meal-modal";
import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — Kal" }] }),
  component: Page,
});

function Page() {
  const [open, setOpen] = useState(false);
  const meals = useAppStore((s) => s.meals);
  const removeMeal = useAppStore((s) => s.removeMeal);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof meals>();
    for (const m of [...meals].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
      const key = new Date(m.createdAt).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [meals]);

  return (
    <div className="mx-auto min-h-screen max-w-md pb-32">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-[26px] font-semibold tracking-tight">History</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">All logged meals</p>
      </header>
      <div className="space-y-6 px-5">
        {grouped.length === 0 && (
          <div className="rounded-3xl bg-card p-10 text-center shadow-[var(--shadow-soft)]">
            <p className="text-sm text-muted-foreground">No meals logged yet.</p>
          </div>
        )}
        {grouped.map(([day, list]) => {
          const total = list.reduce(
            (a, m) => a + m.items.reduce((b, i) => b + i.calories, 0),
            0,
          );
          return (
            <div key={day}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="text-sm font-semibold">{day}</h2>
                <span className="text-xs text-muted-foreground">
                  {Math.round(total)} kcal
                </span>
              </div>
              <div className="space-y-2">
                {list.map((m) => {
                  const kcal = Math.round(m.items.reduce((a, i) => a + i.calories, 0));
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{m.mealType}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {m.items.map((i) => i.name).join(", ")}
                        </div>
                      </div>
                      <div className="text-sm font-semibold tabular-nums">{kcal} kcal</div>
                      <button
                        onClick={() => removeMeal(m.id)}
                        aria-label="Delete"
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav onLogMeal={() => setOpen(true)} />
      <LogMealModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
