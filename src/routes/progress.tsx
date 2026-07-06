import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { LogMealModal } from "@/components/log-meal-modal";
import { useState } from "react";
import { BarChart2 } from "lucide-react";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — Kal" }] }),
  component: Page,
});

function Page() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto min-h-screen max-w-md pb-32">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-[26px] font-semibold tracking-tight">Progress</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Your trends over time</p>
      </header>
      <div className="mx-5 flex flex-col items-center gap-3 rounded-3xl bg-card p-10 text-center shadow-[var(--shadow-soft)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <BarChart2 className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">Weekly analytics coming soon</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Track weight, calories and macro trends across days and weeks.
        </p>
      </div>
      <BottomNav onLogMeal={() => setOpen(true)} />
      <LogMealModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
