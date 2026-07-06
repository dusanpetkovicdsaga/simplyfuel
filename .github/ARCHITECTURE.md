# SimplyFuel Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    React App                           │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │  TanStack   │  │   Zustand    │  │  Tailwind   │  │  │
│  │  │   Router    │  │    Store     │  │     CSS     │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │  │
│  │         │                 │                 │          │  │
│  │         └─────────────────┴─────────────────┘          │  │
│  │                           │                             │  │
│  │  ┌────────────────────────┴────────────────────────┐  │  │
│  │  │              Component Tree                      │  │  │
│  │  │  __root → [index|history|progress|profile]      │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                           │                             │  │
│  │  ┌────────────────────────┴────────────────────────┐  │  │
│  │  │           localStorage (Persistence)            │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Future:
┌──────────────┐
│   Backend    │
│   API Server │  ← Real AI Integration
└──────────────┘
```

## Component Hierarchy

```
App (__root.tsx)
├── <Outlet /> (Route-specific content)
│   ├── Home (index.tsx)
│   │   ├── Header (inline)
│   │   ├── CalorieCard (inline)
│   │   ├── MealSlots (inline)
│   │   ├── MacroGrid (inline)
│   │   ├── QuickActions (inline)
│   │   ├── BottomNav
│   │   └── LogMealModal
│   │       ├── Dialog (Radix)
│   │       ├── Textarea
│   │       ├── Button
│   │       └── MacroCard (inline)
│   │
│   ├── History (history.tsx)
│   │   ├── Header
│   │   ├── MealList
│   │   ├── BottomNav
│   │   └── LogMealModal
│   │
│   ├── Progress (progress.tsx)
│   │   ├── Header
│   │   ├── EmptyState
│   │   ├── BottomNav
│   │   └── LogMealModal
│   │
│   └── Profile (profile.tsx)
│       ├── Header
│       ├── ProfileForm
│       ├── BottomNav
│       └── LogMealModal
│
├── QueryClientProvider (React Query)
├── HeadContent (Meta tags)
├── Scripts (TanStack)
└── Toaster (Sonner)
```

## Data Flow

### 1. User Logs a Meal

```
User Input
    ↓
[LogMealModal]
    ↓
analyzeMeal(input)  ← mock-ai.ts
    ↓
MealAnalysis Result
    ↓
User Reviews/Edits
    ↓
addMeal() ← store action
    ↓
Zustand Store Update
    ↓
localStorage.setItem()
    ↓
All subscribed components re-render
    ↓
Toast Notification
```

### 2. Component Reads Data

```
Component Mounts
    ↓
useAppStore((s) => s.meals)  ← Zustand selector
    ↓
Store returns current meals
    ↓
useMemo() computes derived data
    ↓
Component renders with data
```

### 3. State Update Propagation

```
User Action (e.g., delete meal)
    ↓
Store Action (removeMeal)
    ↓
set() updates store
    ↓
Persist middleware saves to localStorage
    ↓
All components subscribed to meals get notified
    ↓
React triggers re-render
    ↓
UI updates
```

## State Management

### Store Structure

```typescript
{
  // User preferences
  user: {
    name: string,
    dailyCalories: number,
    proteinGoal: number,
    carbsGoal: number,
    fatGoal: number
  },
  
  // Meal log
  meals: [
    {
      id: string,              // UUID
      mealType: MealType,      // Breakfast|Lunch|Dinner|Snacks
      createdAt: string,       // ISO timestamp
      items: [
        {
          id: string,          // UUID
          name: string,        // "Eggs"
          quantity: number,    // 2
          grams: number,       // 100
          calories: number,    // 140
          protein: number,     // 12
          carbs: number,       // 2
          fat: number          // 10
        }
      ]
    }
  ],
  
  // Actions
  addMeal: (type, items) => void,
  removeMeal: (id) => void,
  updateUser: (partial) => void
}
```

### Persistence

```
Zustand Store
    ↓
persist() middleware
    ↓
localStorage
  key: "kal-store-v1"
  value: JSON serialized state
```

On app load:
```
localStorage.getItem("kal-store-v1")
    ↓
JSON.parse()
    ↓
Hydrate Zustand store
    ↓
Components render with persisted data
```

## Routing Architecture

### File-Based Routing

```
src/routes/
  __root.tsx      → App shell (always rendered)
  index.tsx       → /
  history.tsx     → /history
  progress.tsx    → /progress
  profile.tsx     → /profile
```

### Route Lifecycle

```
User clicks Link
    ↓
TanStack Router intercepts
    ↓
Match route pattern
    ↓
Load route component
    ↓
Call route.head() → Update meta tags
    ↓
Render component inside __root <Outlet />
    ↓
Update browser URL (history.pushState)
```

### Navigation Methods

1. **Declarative**: `<Link to="/profile">`
2. **Programmatic**: `navigate({ to: "/profile" })`
3. **Browser**: Back/Forward buttons

## Styling System

### Tailwind Configuration

```
styles.css
  ↓
@tailwind base    ← Reset + base styles
@tailwind components
@tailwind utilities
  ↓
CSS Variables
  --primary: oklch(...)
  --secondary: oklch(...)
  --shadow-soft: ...
  ↓
Component Classes
  bg-primary
  text-muted-foreground
  shadow-[var(--shadow-soft)]
```

### Component Styling Pattern

```typescript
// 1. Base classes
const baseClasses = "rounded-3xl bg-card p-5";

// 2. Conditional classes with cn()
const className = cn(
  baseClasses,
  isActive && "border-2 border-primary",
  size === "small" && "p-3"
);

// 3. Apply to element
<div className={className}>...</div>
```

## UI Component Library

### Radix UI Primitives

```
Unstyled Accessible Components
  ↓
Shadcn/ui (Tailwind styling)
  ↓
Project Components (src/components/ui/)
  ↓
Page Components use them
```

Example: Dialog
```
@radix-ui/react-dialog (behavior)
    ↓
components/ui/dialog.tsx (styling)
    ↓
LogMealModal (application logic)
```

## Mock AI System

### Current Implementation

```typescript
analyzeMeal(input: string)
    ↓
1. Simulate delay (900ms)
    ↓
2. Parse input text
   - Lowercase conversion
   - Keyword matching
   - Quantity extraction
    ↓
3. Match to FOOD_DB
   - "egg" → Eggs (78 cal)
   - "chicken" → Chicken (240 cal)
    ↓
4. Calculate quantities
   - "2 eggs" → 2 × 78 = 156 cal
    ↓
5. Sum totals
   - Total calories
   - Total macros
    ↓
6. Detect meal type
   - Based on time of day
    ↓
7. Return MealAnalysis
```

### Food Database Structure

```typescript
FOOD_DB = {
  "egg": {
    name: "Eggs",
    grams: 50,      // per unit
    calories: 78,   // per unit
    protein: 6,
    carbs: 1,
    fat: 5
  },
  // ... more foods
}
```

### Future Real AI

```
User Input
    ↓
POST /api/analyze
  body: { description: "2 eggs and toast" }
    ↓
AI Service (OpenAI/Claude/Gemini)
  - NLP processing
  - Entity extraction
  - Portion estimation
    ↓
Nutrition Database Lookup
  - USDA FoodData Central
  - Nutritionix API
    ↓
Response
  {
    foods: [...],
    totals: {...},
    confidence: 0.95
  }
    ↓
Frontend displays result
```

## Error Handling

### Layers

```
1. Component Level
   try-catch in event handlers
   → toast.error()
   → log to console

2. Route Level
   ErrorComponent in routes
   → Display error UI
   → Retry button

3. Root Level
   ErrorBoundary in __root.tsx
   → Catch uncaught errors
   → Report to Lovable
   → Show fallback UI

4. Future: API Level
   → Retry logic
   → Exponential backoff
   → Error codes
```

## Performance Considerations

### Optimization Strategies

1. **Memoization**
```typescript
const totals = useMemo(() => sumTotals(meals), [meals]);
```

2. **Selective Store Subscriptions**
```typescript
// Bad: Re-renders on any store change
const store = useAppStore();

// Good: Re-renders only when meals change
const meals = useAppStore((s) => s.meals);
```

3. **Code Splitting**
```typescript
// Future: Lazy load routes
const Profile = lazy(() => import("./routes/profile"));
```

4. **Virtual Scrolling**
```typescript
// Future: For long meal lists
<VirtualList items={meals} />
```

## Build & Deploy

### Development

```
bun dev
  ↓
Vite Dev Server
  - HMR enabled
  - Source maps
  - Fast refresh
    ↓
localhost:3000
```

### Production Build

```
bun build
  ↓
Vite Build
  - Minification
  - Tree shaking
  - Asset optimization
  - Code splitting
    ↓
dist/
  - Static HTML
  - JS bundles
  - CSS
  - Assets
    ↓
Deploy to CDN/Hosting
```

### Current Deployment

- **Platform**: Lovable
- **Branch**: Connected to git
- **Auto-deploy**: On push to main
- **Environment**: Production

## Security Considerations

### Current (Client-Side Only)

1. **XSS Prevention**: React escapes by default
2. **Input Sanitization**: Zod validation
3. **No Sensitive Data**: All data client-side
4. **HTTPS**: Required by Lovable platform

### Future (With Backend)

1. **Authentication**: JWT tokens
2. **Authorization**: Role-based access
3. **Rate Limiting**: API throttling
4. **Data Encryption**: At rest and in transit
5. **Input Validation**: Server-side validation
6. **CORS**: Restricted origins
7. **API Keys**: Secure storage
8. **Audit Logs**: Track data access

## Testing Strategy

### Current State
- Manual testing
- No automated tests yet

### Planned Testing Pyramid

```
        /\
       /E2E\        ← Few (critical flows)
      /──────\
     /  Int   \     ← Some (component interactions)
    /──────────\
   /   Unit     \   ← Many (business logic)
  /──────────────\
```

**Unit Tests**
- Store actions
- Helper functions (todaysMeals, sumTotals)
- Mock AI logic

**Integration Tests**
- Component + Store
- Form submissions
- Modal workflows

**E2E Tests**
- Log meal flow
- View history
- Update profile

## Monitoring & Analytics (Future)

```
Application
    ↓
Events
  - page_view
  - meal_logged
  - error_occurred
    ↓
Analytics Service
  - Plausible (privacy-friendly)
  - PostHog (product analytics)
    ↓
Error Reporting
  - Sentry
  - Crash reports
    ↓
Performance
  - Web Vitals
  - Lighthouse CI
    ↓
Dashboard
  - User metrics
  - Error rates
  - Performance scores
```

## Scalability Considerations

### Current Limits
- localStorage: ~5-10MB
- Performance: Hundreds of meals
- Sync: Single device only

### Future Scaling

**Database**
- PostgreSQL for relational data
- Redis for caching
- S3 for photos

**API**
- Load balancer
- Horizontal scaling
- CDN for static assets

**Optimization**
- Pagination for history
- Lazy loading
- Service workers
- Background sync

## Development Workflow

```
1. Local Development
   bun dev → Make changes → HMR updates

2. Testing
   bun lint → Fix issues
   bun format → Code style

3. Commit
   git add → git commit → Descriptive message

4. Push
   git push → Lovable auto-deploy

5. Verify
   Check production → Test changes
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/routes/__root.tsx` | App shell, providers |
| `src/lib/store.ts` | State management |
| `src/lib/mock-ai.ts` | Meal analysis logic |
| `src/components/log-meal-modal.tsx` | Main feature UI |
| `src/components/bottom-nav.tsx` | Navigation |
| `src/styles.css` | Global styles |
| `vite.config.ts` | Build configuration |
| `tsconfig.json` | TypeScript settings |
| `package.json` | Dependencies |

---

*This architecture documentation should be updated as the system evolves.*

Last updated: July 6, 2026
