# SimplyFuel Quick Reference

Quick patterns and code snippets for common tasks in the SimplyFuel project.

## Table of Contents
- [Adding a New Route](#adding-a-new-route)
- [Adding a Store Action](#adding-a-store-action)
- [Creating a Modal](#creating-a-modal)
- [Form with Validation](#form-with-validation)
- [Toast Notifications](#toast-notifications)
- [Accessing Store](#accessing-store)
- [Computed Values](#computed-values)
- [Styling Patterns](#styling-patterns)

---

## Adding a New Route

Create `src/routes/my-page.tsx`:

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/my-page")({
  head: () => ({
    meta: [
      { title: "My Page — Kal" },
      { name: "description", content: "Description" }
    ]
  }),
  component: MyPage
});

function MyPage() {
  return (
    <div className="mx-auto min-h-screen max-w-md pb-32">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-[26px] font-semibold tracking-tight">My Page</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Description</p>
      </header>
      
      <main className="space-y-4 px-5">
        {/* Content */}
      </main>
      
      <BottomNav onLogMeal={() => {}} />
    </div>
  );
}
```

**Dynamic routes**: Use `$paramName.tsx`
```typescript
// src/routes/meals/$id.tsx
export const Route = createFileRoute("/meals/$id")({
  component: MealDetail
});

function MealDetail() {
  const { id } = Route.useParams();
  return <div>Meal ID: {id}</div>;
}
```

---

## Adding a Store Action

Edit `src/lib/store.ts`:

```typescript
// 1. Add to State type
type State = {
  // ... existing
  myNewValue: string;
  myNewAction: (value: string) => void;
};

// 2. Implement in create()
export const useAppStore = create<State>()(
  persist(
    (set) => ({
      // ... existing
      myNewValue: "default",
      myNewAction: (value) => 
        set({ myNewValue: value }),
    }),
    { name: "kal-store-v1" }
  )
);
```

**Common patterns**:

```typescript
// Add item to array
addItem: (item) => 
  set((s) => ({ items: [...s.items, item] })),

// Update object
updateUser: (updates) => 
  set((s) => ({ user: { ...s.user, ...updates } })),

// Filter array
removeItem: (id) => 
  set((s) => ({ items: s.items.filter(i => i.id !== id) })),

// Toggle boolean
toggle: () => 
  set((s) => ({ isOpen: !s.isOpen })),
```

---

## Creating a Modal

```typescript
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MyModal({ open, onOpenChange }: Props) {
  const [value, setValue] = useState("");
  
  const handleSave = () => {
    // Do something
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Content */}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Usage in component**:
```typescript
const [modalOpen, setModalOpen] = useState(false);

return (
  <>
    <Button onClick={() => setModalOpen(true)}>Open</Button>
    <MyModal open={modalOpen} onOpenChange={setModalOpen} />
  </>
);
```

---

## Form with Validation

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 1. Define schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  calories: z.number().min(0).max(10000),
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof formSchema>;

// 2. Component
export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      calories: 2000,
      email: "",
    },
  });
  
  const onSubmit = (data: FormData) => {
    console.log(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

---

## Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Meal logged!");

// With description
toast.success("Meal logged", {
  description: "140 calories added"
});

// Error
toast.error("Failed to save");

// Info
toast.info("Coming soon");

// Loading
const toastId = toast.loading("Analyzing...");
// Later
toast.success("Done!", { id: toastId });

// Custom duration (ms)
toast.success("Quick message", { duration: 2000 });
```

**In root layout** (already added):
```typescript
import { Toaster } from "@/components/ui/sonner";

<Toaster />
```

---

## Accessing Store

```typescript
import { useAppStore } from "@/lib/store";

// Select single value
const userName = useAppStore((s) => s.user.name);

// Select multiple values
const meals = useAppStore((s) => s.meals);
const addMeal = useAppStore((s) => s.addMeal);

// Select nested value
const dailyCalories = useAppStore((s) => s.user.dailyCalories);

// Use action
const handleAdd = () => {
  addMeal("Breakfast", items);
};
```

**Outside components**:
```typescript
// Get current state
const currentUser = useAppStore.getState().user;

// Subscribe to changes
const unsubscribe = useAppStore.subscribe(
  (state) => console.log(state.meals)
);
```

---

## Computed Values

```typescript
import { useMemo } from "react";
import { todaysMeals, sumTotals } from "@/lib/store";

function MyComponent() {
  const meals = useAppStore((s) => s.meals);
  
  // Memoize expensive calculations
  const today = useMemo(() => todaysMeals(meals), [meals]);
  
  const totals = useMemo(() => sumTotals(today), [today]);
  
  const percentage = useMemo(
    () => (totals.calories / 2400) * 100,
    [totals.calories]
  );
  
  return <div>{percentage.toFixed(1)}%</div>;
}
```

---

## Styling Patterns

### Card Component
```typescript
<div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
  <h2 className="text-xl font-semibold">Title</h2>
  <p className="mt-2 text-sm text-muted-foreground">Description</p>
</div>
```

### Button Variants
```typescript
// Primary
<Button className="bg-primary text-primary-foreground">
  Save
</Button>

// Outline
<Button variant="outline">Cancel</Button>

// Ghost (no background)
<Button variant="ghost">Edit</Button>

// Icon button
<button className="rounded-full p-2.5 hover:bg-accent">
  <Icon className="h-5 w-5" />
</button>
```

### Conditional Classes
```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "border-2 border-primary",
  size === "large" && "p-6"
)} />
```

### Grid Layouts
```typescript
// Single column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Flex Layouts
```typescript
// Horizontal with space between
<div className="flex items-center justify-between">
  <span>Label</span>
  <span>Value</span>
</div>

// Vertical stack
<div className="flex flex-col gap-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Progress Bar
```typescript
const percentage = 65;

<div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
  <div
    className="h-full rounded-full bg-primary transition-all duration-500"
    style={{ width: `${percentage}%` }}
  />
</div>
```

### Mobile Navigation Safe Area
```typescript
<nav className="fixed bottom-0 left-0 right-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
  {/* Nav items */}
</nav>
```

---

## Icons

```typescript
import { Home, User, Settings, Plus, X } from "lucide-react";

// Standard size
<Home className="h-5 w-5" />

// Small icon
<Plus className="h-4 w-4" />

// With color
<Settings className="h-5 w-5 text-primary" />

// Stroke width
<User className="h-5 w-5" strokeWidth={2.5} />
```

[Browse all icons](https://lucide.dev/icons/)

---

## Date Formatting

```typescript
import { format } from "date-fns";

// Full date
const date = new Date();
format(date, "MMMM d, yyyy"); // "July 6, 2026"

// Short date
format(date, "MMM d"); // "Jul 6"

// Time
format(date, "h:mm a"); // "2:30 PM"

// Built-in
date.toLocaleDateString("en-US", {
  weekday: "long",
  month: "long", 
  day: "numeric"
}); // "Monday, July 6"
```

---

## Loading States

```typescript
function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  return <div>{/* Loaded content */}</div>;
}
```

---

## Error Boundary Pattern

```typescript
try {
  const result = await riskyOperation();
  toast.success("Success!");
  return result;
} catch (error) {
  console.error("Operation failed:", error);
  toast.error(
    error instanceof Error 
      ? error.message 
      : "Something went wrong"
  );
  return null;
}
```

---

## Navigation

```typescript
import { Link, useNavigate } from "@tanstack/react-router";

// Link component
<Link to="/profile" className="text-primary">
  Go to Profile
</Link>

// Programmatic navigation
const navigate = useNavigate();

const handleClick = () => {
  navigate({ to: "/history" });
};

// With params
navigate({ to: "/meals/$id", params: { id: "123" } });

// With search params
navigate({ to: "/search", search: { query: "pizza" } });
```

---

## TypeScript Helpers

```typescript
// Extract props type from component
type ButtonProps = React.ComponentProps<typeof Button>;

// Make all properties optional
type PartialUser = Partial<User>;

// Pick specific properties
type UserName = Pick<User, "name">;

// Omit properties
type UserWithoutId = Omit<User, "id">;

// Array element type
type MealType = Meal[];  // Wrong
type MealType = Meal[number];  // Correct

// Function return type
type AnalysisResult = ReturnType<typeof analyzeMeal>;
```

---

## Debugging Tips

```typescript
// Log store state
console.log(useAppStore.getState());

// Log prop changes
useEffect(() => {
  console.log("Props changed:", { prop1, prop2 });
}, [prop1, prop2]);

// Conditional logging
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}

// React DevTools
// Install extension and inspect component tree
```

---

## Common Files Reference

- **Store**: `src/lib/store.ts`
- **Styles**: `src/styles.css`
- **Utils**: `src/lib/utils.ts`
- **Config**: `vite.config.ts`, `tsconfig.json`
- **Components**: `src/components/ui/`
- **Routes**: `src/routes/`

---

Need more examples? Check existing code in the repository!
