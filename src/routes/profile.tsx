import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { LogMealModal } from "@/components/log-meal-modal";
import { AuthModal } from "@/components/auth-modal";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { LogIn, LogOut, Cloud, CloudOff } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Kal" }] }),
  component: Page,
});

function Page() {
  const [logMealOpen, setLogMealOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  
  const { user: authUser, signOut, loading: authLoading } = useAuth();
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const loadUserProfile = useAppStore((s) => s.loadUserProfile);
  const syncToSupabase = useAppStore((s) => s.syncToSupabase);
  const syncing = useAppStore((s) => s.syncing);

  // Load profile when user signs in
  useEffect(() => {
    if (authUser) {
      syncToSupabase(authUser.id);
    }
  }, [authUser]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const handleSaveProfile = async () => {
    await updateUser({
      name: user.name,
      dailyCalories: user.dailyCalories,
      proteinGoal: user.proteinGoal,
      carbsGoal: user.carbsGoal,
      fatGoal: user.fatGoal,
    });
    toast.success("Profile saved!");
  };

  return (
    <div className="mx-auto min-h-screen max-w-md pb-32">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-[26px] font-semibold tracking-tight">Profile</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Your goals and preferences</p>
      </header>
      <div className="mx-5 space-y-4">
        {/* Auth Status Card */}
        <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {authUser ? (
                <Cloud className="h-5 w-5 text-primary" />
              ) : (
                <CloudOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {authUser ? "Signed In" : "Local Only"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {authUser ? authUser.email : "Data saved locally"}
                </p>
              </div>
            </div>
            {authUser ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={authLoading}
                className="rounded-xl"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setAuthOpen(true)}
                className="rounded-xl"
              >
                <LogIn className="mr-1 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {user.name[0]}
            </div>
            <div className="flex-1">
              <Input
                value={user.name}
                onChange={(e) => useAppStore.setState({ user: { ...user, name: e.target.value } })}
                className="h-9 rounded-lg text-base font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Goals Card */}
        <div className="space-y-3 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-sm font-semibold text-muted-foreground">Daily goals</h2>
          <GoalRow
            label="Calories (kcal)"
            value={user.dailyCalories}
            onChange={(v) => useAppStore.setState({ user: { ...user, dailyCalories: v } })}
          />
          <GoalRow
            label="Protein (g)"
            value={user.proteinGoal}
            onChange={(v) => useAppStore.setState({ user: { ...user, proteinGoal: v } })}
          />
          <GoalRow
            label="Carbs (g)"
            value={user.carbsGoal}
            onChange={(v) => useAppStore.setState({ user: { ...user, carbsGoal: v } })}
          />
          <GoalRow
            label="Fat (g)"
            value={user.fatGoal}
            onChange={(v) => useAppStore.setState({ user: { ...user, fatGoal: v } })}
          />
          <Button
            onClick={handleSaveProfile}
            disabled={syncing}
            className="mt-2 h-11 w-full rounded-2xl text-sm font-semibold"
          >
            {syncing ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <BottomNav onLogMeal={() => setLogMealOpen(true)} />
      <LogMealModal open={logMealOpen} onOpenChange={setLogMealOpen} />
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <Toaster position="top-center" />
    </div>
  );
}

function GoalRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-9 w-24 rounded-lg text-right"
      />
    </div>
  );
}
