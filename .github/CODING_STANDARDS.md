# SimplyFuel Coding Standards

## Architecture Principles

### 1. Component Architecture
- **Small, focused components** - Single responsibility principle
- **Composition over inheritance** - Build complex UIs from simple parts
- **Co-located state** - Keep state as local as possible
- **Lift when needed** - Move to Zustand only when shared across routes

### 2. Data Flow
```
User Input → Component → Store → All Subscribers → UI Update
            ↓
         Validation → Error/Success → Toast Notification
```

## TypeScript Best Practices

### Type Definitions

✅ **Good**
```typescript
type MealItem = AnalyzedFood & { id: string };

type User = {
  name: string;
  dailyCalories: number;
};

// Derived types
type PartialUser = Partial<User>;
```

❌ **Bad**
```typescript
// Don't use any
const data: any = fetchData();

// Don't use implicit types
function calculate(x, y) { return x + y; }
```

### Null Safety

✅ **Good**
```typescript
const meal = meals.find(m => m.id === id);
if (!meal) return null;

// Optional chaining
const calories = meal?.items?.reduce((sum, item) => sum + item.calories, 0) ?? 0;
```

❌ **Bad**
```typescript
// No null checks
const meal = meals.find(m => m.id === id);
return meal.items.length; // Can crash
```

## React Patterns

### Component Structure

✅ **Good**
```typescript
import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

type Props = {
  mealType: MealType;
  onSave: () => void;
};

export function MealCard({ mealType, onSave }: Props) {
  // 1. Hooks
  const [editing, setEditing] = useState(false);
  const meals = useAppStore((s) => s.meals);
  
  // 2. Computed values
  const filtered = useMemo(() => 
    meals.filter(m => m.mealType === mealType),
    [meals, mealType]
  );
  
  // 3. Event handlers
  const handleEdit = () => setEditing(true);
  
  // 4. Render
  return <div onClick={handleEdit}>...</div>;
}
```

❌ **Bad**
```typescript
export function MealCard(props: any) {
  // Inline functions (re-created every render)
  return (
    <div onClick={() => { setEditing(true); }}>
      {/* Expensive calculation without memo */}
      {meals.filter(m => m.mealType === props.type).map(...)}
    </div>
  );
}
```

### State Management

✅ **Good**
```typescript
// Store for shared state
const addMeal = useAppStore((s) => s.addMeal);

// Component state for UI-only state
const [isOpen, setIsOpen] = useState(false);

// Derived state with useMemo
const total = useMemo(() => sumTotals(meals), [meals]);
```

❌ **Bad**
```typescript
// Don't store derived data
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(sumTotals(meals));
}, [meals]); // This is redundant
```

### Custom Hooks

✅ **Good**
```typescript
// Extract reusable logic
function useMealTotals(meals: Meal[]) {
  return useMemo(() => ({
    today: todaysMeals(meals),
    totals: sumTotals(todaysMeals(meals))
  }), [meals]);
}

// Use in components
const { today, totals } = useMealTotals(meals);
```

## Styling Standards

### Tailwind Composition

✅ **Good**
```typescript
const cardClasses = cn(
  // Base styles
  "rounded-3xl bg-card p-5",
  // Conditional
  isActive && "border-2 border-primary",
  // Variants
  variant === "compact" && "p-3"
);
```

❌ **Bad**
```typescript
// String concatenation
const classes = "rounded-3xl " + (isActive ? "active " : "") + "p-5";

// Inline styles without cn()
<div className={`rounded-3xl ${isActive ? 'active' : ''}`} />
```

### Responsive Design

✅ **Good**
```typescript
<div className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2 sm:gap-6
  lg:grid-cols-3
">
```

❌ **Bad**
```typescript
// Fixed widths
<div style={{ width: '400px' }}>

// Non-mobile-first
<div className="w-full lg:w-1/2 md:w-2/3 sm:w-full">
```

## Performance Optimization

### Memoization

✅ **Good**
```typescript
// Expensive calculations
const stats = useMemo(() => 
  calculateComplexStats(meals),
  [meals]
);

// Callback memoization
const handleSave = useCallback((data: MealData) => {
  addMeal(data.type, data.items);
}, [addMeal]);
```

### Avoid Re-renders

✅ **Good**
```typescript
// Select only what you need from store
const userName = useAppStore((s) => s.user.name);

// Shallow comparison for objects
const user = useAppStore(
  (s) => ({ name: s.user.name, calories: s.user.dailyCalories }),
  shallow
);
```

❌ **Bad**
```typescript
// Selecting entire store causes re-renders
const store = useAppStore();
return <div>{store.user.name}</div>;
```

## Error Handling

### Async Operations

✅ **Good**
```typescript
async function loadMeal() {
  setLoading(true);
  try {
    const result = await analyzeMeal(input);
    setResult(result);
    toast.success("Meal analyzed");
  } catch (error) {
    console.error("Analysis failed:", error);
    toast.error("Failed to analyze meal. Please try again.");
  } finally {
    setLoading(false);
  }
}
```

❌ **Bad**
```typescript
async function loadMeal() {
  const result = await analyzeMeal(input); // Can throw
  setResult(result);
}
```

### Form Validation

✅ **Good**
```typescript
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  calories: z.number().min(0).max(10000)
});

type FormData = z.infer<typeof schema>;

const form = useForm<FormData>({
  resolver: zodResolver(schema)
});
```

## API Integration

### Current Mock Pattern

```typescript
export async function analyzeMeal(input: string): Promise<MealAnalysis> {
  // Simulate delay
  await new Promise(r => setTimeout(r, 900));
  
  // Parse and return
  return {
    mealType: detectMealType(),
    foods: parseFoods(input),
    totals: calculateTotals(foods)
  };
}
```

### Future Real API

```typescript
export async function analyzeMeal(input: string): Promise<MealAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: input })
  });
  
  if (!response.ok) {
    throw new Error('Analysis failed');
  }
  
  return response.json();
}
```

## Testing Patterns

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LogMealModal } from './log-meal-modal';

test('opens modal and submits meal', async () => {
  const onSave = jest.fn();
  render(<LogMealModal open onOpenChange={() => {}} onSave={onSave} />);
  
  // Find input
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: '2 eggs' } });
  
  // Submit
  const button = screen.getByText('Analyze');
  fireEvent.click(button);
  
  // Wait for result
  await screen.findByText(/analyzed/i);
  
  // Verify
  expect(onSave).toHaveBeenCalled();
});
```

### Store Tests

```typescript
import { act } from '@testing-library/react';
import { useAppStore } from './store';

test('adds meal to store', () => {
  const { addMeal, meals } = useAppStore.getState();
  
  act(() => {
    addMeal('Breakfast', [
      { name: 'Eggs', calories: 140, protein: 12, carbs: 2, fat: 10 }
    ]);
  });
  
  const newMeals = useAppStore.getState().meals;
  expect(newMeals).toHaveLength(1);
  expect(newMeals[0].mealType).toBe('Breakfast');
});
```

## File Organization

### Component Files

```typescript
// log-meal-modal.tsx

// 1. Imports - external
import { useState } from "react";
import { Sparkles } from "lucide-react";

// 2. Imports - internal
import { analyzeMeal } from "@/lib/mock-ai";
import { useAppStore } from "@/lib/store";

// 3. Imports - components
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// 4. Types
type Props = { open: boolean; onOpenChange: (v: boolean) => void };

// 5. Constants
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"] as const;

// 6. Component
export function LogMealModal({ open, onOpenChange }: Props) {
  // Component code
}

// 7. Sub-components (if any, prefer separate files)
```

## Common Anti-Patterns

### ❌ Don't

```typescript
// 1. Don't mutate state directly
meals.push(newMeal); // BAD
setMeals([...meals, newMeal]); // GOOD

// 2. Don't use index as key
{items.map((item, i) => <div key={i}>...)} // BAD
{items.map(item => <div key={item.id}>...)} // GOOD

// 3. Don't over-optimize prematurely
useCallback(() => setCount(1), []); // Usually unnecessary for simple callbacks

// 4. Don't nest ternaries deeply
{a ? b ? c : d : e} // BAD
{a && b ? c : (a ? d : e)} // BETTER
// Or extract to variable/function

// 5. Don't use !important in CSS
.my-class { color: red !important; } // BAD
```

## Accessibility Checklist

- [ ] All buttons have accessible labels
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] ARIA roles for custom components
- [ ] Color contrast meets WCAG AA
- [ ] Alt text for images
- [ ] Heading hierarchy maintained
- [ ] Form labels associated with inputs

## Git Commit Messages

```
feat: add meal editing functionality
fix: correct calorie calculation for multi-item meals
refactor: extract meal card into separate component
docs: update README with deployment instructions
style: format code with prettier
test: add tests for store mutations
chore: update dependencies
```

## Code Review Checklist

Before submitting:
- [ ] TypeScript with no errors
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] No console.logs (except intentional)
- [ ] Mobile responsive tested
- [ ] Accessibility verified
- [ ] Error handling implemented
- [ ] Loading states included
- [ ] Tests written (if applicable)
