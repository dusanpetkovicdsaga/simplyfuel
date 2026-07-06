import { useState, useEffect } from "react";
import { Mic, Sparkles, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { analyzeMeal, type MealAnalysis } from "@/lib/mock-ai";
import { useAppStore, type MealType } from "@/lib/store";
import { toast } from "sonner";

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const PLACEHOLDERS = [
  "2 eggs and toast",
  "Chicken salad",
  "Pizza and Coke",
  "250g steak with potatoes",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMealType?: MealType;
};

export function LogMealModal({ open, onOpenChange, defaultMealType }: Props) {
  const [step, setStep] = useState<"input" | "result">("input");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealAnalysis | null>(null);
  const addMeal = useAppStore((s) => s.addMeal);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("input");
        setInput("");
        setResult(null);
      }, 200);
    }
  }, [open]);

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const r = await analyzeMeal(input);
      if (defaultMealType) r.mealType = defaultMealType;
      setResult(r);
      setStep("result");
    } finally {
      setLoading(false);
    }
  };

  const updateFood = (idx: number, patch: Partial<MealAnalysis["foods"][number]>) => {
    if (!result) return;
    const foods = result.foods.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    const totals = foods.reduce(
      (a, f) => ({
        calories: a.calories + f.calories,
        protein: a.protein + f.protein,
        carbs: a.carbs + f.carbs,
        fat: a.fat + f.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
    setResult({ ...result, foods, totals });
  };

  const save = () => {
    if (!result) return;
    addMeal(result.mealType, result.foods);
    toast.success(`${result.mealType} logged`, {
      description: `${Math.round(result.totals.calories)} kcal added`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md gap-0 rounded-3xl border-0 p-0 shadow-2xl"
      >
        {step === "input" ? (
          <div className="p-6">
            <div className="mb-1 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" /> AI powered
              </div>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">What did you eat?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe your meal in natural language.
            </p>
            <div className="relative mt-5">
              <Textarea
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`e.g. ${PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]}`}
                rows={4}
                className="resize-none rounded-2xl border-border bg-muted/40 pr-12 text-base focus-visible:ring-primary"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") analyze();
                }}
              />
              <button
                type="button"
                aria-label="Voice input (coming soon)"
                className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground transition hover:bg-background hover:text-primary"
                onClick={() => toast("Voice input coming soon")}
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PLACEHOLDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {p}
                </button>
              ))}
            </div>
            <Button
              onClick={analyze}
              disabled={!input.trim() || loading}
              className="mt-5 h-12 w-full rounded-2xl text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Analyze Meal
                </>
              )}
            </Button>
          </div>
        ) : (
          result && (
            <div className="flex max-h-[85vh] flex-col">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <button
                  onClick={() => setStep("input")}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" /> Analyzed
                </div>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Meal
                  </label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {MEAL_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setResult({ ...result, mealType: t })}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                          result.mealType === t
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Foods detected
                  </label>
                  <div className="mt-2 space-y-2">
                    {result.foods.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{f.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(f.calories)} kcal
                          </div>
                        </div>
                        <Input
                          type="number"
                          value={f.quantity}
                          min={1}
                          onChange={(e) => {
                            const q = Math.max(1, Number(e.target.value) || 1);
                            const ratio = q / f.quantity;
                            updateFood(i, {
                              quantity: q,
                              grams: Math.round(f.grams * ratio),
                              calories: Math.round(f.calories * ratio),
                              protein: Math.round(f.protein * ratio),
                              carbs: Math.round(f.carbs * ratio),
                              fat: Math.round(f.fat * ratio),
                            });
                          }}
                          className="h-9 w-14 rounded-lg text-center text-sm"
                        />
                        <div className="w-10 text-right text-xs text-muted-foreground">
                          {f.grams}g
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Estimated nutrition
                  </label>
                  <div className="mt-2 rounded-2xl bg-muted/50 p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">Calories</span>
                      <span className="text-2xl font-semibold tracking-tight">
                        {Math.round(result.totals.calories)}
                        <span className="ml-1 text-sm font-normal text-muted-foreground">kcal</span>
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3">
                      <Macro label="Protein" value={result.totals.protein} color="text-protein" />
                      <Macro label="Carbs" value={result.totals.carbs} color="text-carbs" />
                      <Macro label="Fat" value={result.totals.fat} color="text-fat" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border p-4">
                <Button
                  onClick={save}
                  className="h-12 w-full rounded-2xl text-base font-semibold"
                >
                  Save Meal
                </Button>
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold ${color}`}>
        {Math.round(value)}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">g</span>
      </div>
    </div>
  );
}
