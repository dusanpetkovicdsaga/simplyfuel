import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Settings, Pencil, Plus, ChevronRight, Clock } from "lucide-react";
import { useAppStore, todaysMeals, sumTotals, type MealType } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { LogMealModal } from "@/components/log-meal-modal";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kal — AI Calorie Tracker" },
      { name: "description", content: "Track calories and macros in seconds with AI." },
      { property: "og:title", content: "Kal — AI Calorie Tracker" },
      { property: "og:description", content: "Log any meal in under 15 seconds." },
    ],
  }),
  component: Home,
});

const MEAL_SLOTS: { type: MealType; emoji: string; bg: string }[] = [
  { type: "Breakfast", emoji: "🍳", bg: "bg-[oklch(0.95_0.04_25)]" },
  { type: "Lunch", emoji: "🌯", bg: "bg-[oklch(0.95_0.05_140)]" },
  { type: "Dinner", emoji: "🍝", bg: "bg-[oklch(0.95_0.04_293)]" },
  { type: "Snacks", emoji: "🍎", bg: "bg-[oklch(0.96_0.06_75)]" },
];

function Home() {
  const { user: authUser } = useAuth();
  const user = useAppStore((s) => s.user);
  const meals = useAppStore((s) => s.meals);
  const syncToSupabase = useAppStore((s) => s.syncToSupabase);
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultMeal, setDefaultMeal] = useState<MealType | undefined>();

  // Sync meals when user logs in
  useEffect(() => {
    if (authUser) {
      syncToSupabase(authUser.id);
    }
  }, [authUser]);

  const today = useMemo(() => todaysMeals(meals), [meals]);
  const totals = useMemo(() => sumTotals(today), [today]);
  const caloriesPct = Math.min(100, (totals.calories / user.dailyCalories) * 100);
  const remaining = Math.max(0, user.dailyCalories - totals.calories);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const openLog = (t?: MealType) => {
    setDefaultMeal(t);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-48">
      <header className="flex items-start justify-between px-5 pt-8 pb-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight leading-tight">
            {greeting}, {user.name} 👋
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{dateLabel}</p>
        </div>
        <button
          aria-label="Settings"
          className="rounded-full border border-border bg-card p-2.5 text-foreground shadow-[var(--shadow-soft)]"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      <main className="space-y-4 px-5">
        {/* Calorie Card */}
        <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Calories</span>
            <button className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              <Pencil className="h-3.5 w-3.5" /> Edit Goal
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-5xl font-semibold tracking-tight tabular-nums">
              {Math.round(totals.calories).toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              / {user.dailyCalories.toLocaleString()} kcal
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${caloriesPct}%` }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums">{Math.round(caloriesPct)}%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {remaining.toLocaleString()} kcal left
          </p>
        </section>

        {/* Macros */}
        <section className="grid grid-cols-3 gap-2 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <MacroTile
            label="Protein"
            value={totals.protein}
            goal={user.proteinGoal}
            color="protein"
            emoji="💪"
          />
          <MacroTile
            label="Carbs"
            value={totals.carbs}
            goal={user.carbsGoal}
            color="carbs"
            emoji="🌾"
          />
          <MacroTile label="Fat" value={totals.fat} goal={user.fatGoal} color="fat" emoji="💧" />
        </section>

        {/* Meals */}
        <section className="pt-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Today's meals</h2>
            <button className="text-sm font-medium text-primary">View all</button>
          </div>
          <div className="space-y-2">
            {MEAL_SLOTS.map(({ type, emoji, bg }) => {
              const meal = today.find((m) => m.mealType === type);
              const totalKcal = meal
                ? Math.round(meal.items.reduce((a, i) => a + i.calories, 0))
                : 0;
              const summary = meal
                ? meal.items.map((i) => (i.quantity > 1 ? `${i.name} (${i.quantity})` : i.name)).join(", ")
                : "Not logged yet";
              const time = meal
                ? new Date(meal.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : null;

              return (
                <button
                  key={type}
                  onClick={() => !meal && openLog(type)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-[var(--shadow-soft)] transition active:scale-[0.99]"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${bg}`}>
                    {emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold">{type}</div>
                    <div className="truncate text-xs text-muted-foreground">{summary}</div>
                    {time && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {time}
                      </div>
                    )}
                  </div>
                  {meal ? (
                    <div className="flex items-center gap-1 pr-1">
                      <div className="text-sm font-semibold tabular-nums">{totalKcal}</div>
                      <div className="text-xs text-muted-foreground">kcal</div>
                      <ChevronRight className="ml-1 h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-primary/40 text-primary">
                      <Plus className="h-4 w-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Sticky Log Meal button */}
      <div className="fixed bottom-24 left-0 right-0 z-20 px-5">
        <div className="mx-auto max-w-md">
          <button
            onClick={() => openLog()}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition active:scale-[0.99]"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} /> Log Meal
          </button>
        </div>
      </div>

      <BottomNav onLogMeal={() => openLog()} />
      <LogMealModal open={modalOpen} onOpenChange={setModalOpen} defaultMealType={defaultMeal} />
      <Toaster position="top-center" />
    </div>
  );
}

function MacroTile({
  label,
  value,
  goal,
  color,
  emoji,
}: {
  label: string;
  value: number;
  goal: number;
  color: "protein" | "carbs" | "fat";
  emoji: string;
}) {
  const pct = Math.min(100, (value / goal) * 100);
  const colorMap = {
    protein: { text: "text-protein", bg: "bg-protein", soft: "bg-protein-soft" },
    carbs: { text: "text-carbs", bg: "bg-carbs", soft: "bg-carbs-soft" },
    fat: { text: "text-fat", bg: "bg-fat", soft: "bg-fat-soft" },
  }[color];

  return (
    <div className="flex flex-col items-center px-1 py-1">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${colorMap.soft}`}>
        {emoji}
      </div>
      <div className="mt-2 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">
        <span className={`font-semibold ${colorMap.text}`}>{Math.round(value)}</span>
        <span className="text-muted-foreground"> / {goal}g</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorMap.bg}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] font-medium text-muted-foreground tabular-nums">
        {Math.round(pct)}%
      </div>
    </div>
  );
}
