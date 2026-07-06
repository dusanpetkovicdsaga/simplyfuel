import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Mode = "signin" | "signup";

export function AuthModal({ open, onOpenChange }: Props) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          toast.success("Welcome back!");
          onOpenChange(false);
          resetForm();
        }
      } else {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          toast.success("Account created! Please check your email to verify.");
          onOpenChange(false);
          resetForm();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
    setMode("signin");
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-0 p-0 shadow-2xl">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to sync your meals across devices"
                : "Sign up to start tracking your nutrition"}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-2xl pl-10"
                    required={mode === "signup"}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl pl-10"
                  required
                  minLength={6}
                />
              </div>
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <span className="font-medium text-primary">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="font-medium text-primary">Sign in</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
