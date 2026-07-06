# Contributing to SimplyFuel (Kal)

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Run linter
bun lint

# Format code
bun format
```

## Code Style

### TypeScript
- Use strict TypeScript - no `any` types
- Prefer `type` over `interface`
- Export types alongside their components
- Use functional components with hooks

### React Patterns
```typescript
// ✅ Good
export function MyComponent({ prop }: Props) {
  const [state, setState] = useState();
  return <div>...</div>;
}

// ❌ Bad
export default class MyComponent extends React.Component { ... }
```

### State Management
- Use Zustand store for global state
- Use `useState` for component-local state
- Avoid prop drilling - lift to store if needed

```typescript
// Access store
const meals = useAppStore((s) => s.meals);
const addMeal = useAppStore((s) => s.addMeal);

// Update store
addMeal(mealType, items);
```

### Routing
- Create new routes in `src/routes/`
- Use file-based routing conventions
- Always include route metadata

```typescript
export const Route = createFileRoute("/my-page")({
  head: () => ({
    meta: [{ title: "My Page — Kal" }]
  }),
  component: MyPage
});
```

### Styling
- Use Tailwind utility classes
- Mobile-first responsive design
- Use `cn()` helper for conditional classes

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === "primary" && "variant-classes"
)} />
```

### Components
- Keep components small and focused
- Extract reusable UI to `components/ui/`
- Use Radix UI primitives for accessibility
- Add proper ARIA labels

```typescript
<button
  aria-label="Close modal"
  onClick={handleClose}
>
  <X className="h-4 w-4" />
</button>
```

### Error Handling
- Use try-catch for async operations
- Show user-friendly toast messages
- Log errors to console in dev

```typescript
try {
  await analyzeMeal(input);
  toast.success("Meal logged!");
} catch (error) {
  console.error(error);
  toast.error("Failed to analyze meal");
}
```

### Performance
- Use `useMemo` for expensive calculations
- Avoid inline function definitions in renders
- Lazy load heavy components if needed

```typescript
const totals = useMemo(() => sumTotals(meals), [meals]);
```

## File Organization

```
src/
  routes/          - Page routes (TanStack Router)
  components/      - Shared components
    ui/            - Shadcn/Radix UI primitives
  lib/             - Utilities and business logic
  hooks/           - Custom React hooks
```

## Naming Conventions

- **Files**: kebab-case (`log-meal-modal.tsx`)
- **Components**: PascalCase (`LogMealModal`)
- **Functions**: camelCase (`analyzeMeal`)
- **Types**: PascalCase (`MealType`)
- **Constants**: UPPER_SNAKE_CASE (`MEAL_TYPES`)

## Import Order

```typescript
// 1. External libraries
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

// 2. Internal modules
import { useAppStore } from "@/lib/store";
import { analyzeMeal } from "@/lib/mock-ai";

// 3. Components
import { Button } from "@/components/ui/button";
import { LogMealModal } from "@/components/log-meal-modal";

// 4. Types
import type { MealType } from "@/lib/store";

// 5. Styles
import "@/styles.css";
```

## Testing Guidelines

- Write tests for business logic in `lib/`
- Test user interactions in components
- Mock external dependencies
- Use React Testing Library patterns

## Accessibility

- All interactive elements need focus styles
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images
- ARIA labels for icon-only buttons
- Keyboard navigation support

## Mobile Considerations

- Test on small viewports (320px+)
- Use safe-area-inset for iOS
- Touch targets minimum 44x44px
- Avoid hover-only interactions

## Git Workflow

- Create feature branches from `main`
- Use descriptive commit messages
- **DO NOT** force push or rebase published commits
- Keep commits atomic and focused

## Common Patterns

### Adding a New Route
1. Create file in `src/routes/`
2. Export Route with `createFileRoute`
3. Add head metadata
4. Create component function
5. Add to bottom nav if needed

### Adding a New Modal
1. Create component with Dialog from Radix
2. Use `open` and `onOpenChange` props
3. Handle cleanup on close
4. Add loading and error states

### Adding to Store
1. Define type in `store.ts`
2. Add to state interface
3. Create action function
4. Use in components via `useAppStore`

## Questions?

Check existing code for examples or ask in pull requests.
