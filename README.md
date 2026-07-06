# Kal — AI Calorie Tracker

A mobile-first web application for tracking meals and nutrition using AI-powered natural language processing.

![Project Status](https://img.shields.io/badge/status-MVP-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-19.2-blue)

## ✨ Features

- 🤖 **AI-Powered Meal Analysis** - GPT-4o-mini understands natural language meal descriptions
- 📝 **Natural Language Logging** - "2 eggs and toast" → full nutrition breakdown
- 📊 **Macro Tracking** - Monitor calories, protein, carbs, and fat
- 🎯 **Daily Goals** - Set and track nutrition targets
- 💾 **Smart Food Database** - 18+ common foods with accurate nutrition data
- � **User Authentication** - Secure sign-up/sign-in with Supabase
- ☁️ **Cloud Sync** - Data syncs across devices when signed in
- 📱 **Mobile-First Design** - Optimized for on-the-go tracking
- 🌙 **Dark Mode Ready** - Themed with CSS variables
- ⚡ **Instant Fallback** - Works without API key (local matching)
- 💿 **Offline-First** - Works in guest mode with localStorage

## 🚀 Quick Start

### Prerequisites
- Node.js 24.18+ (use [nvm](https://github.com/nvm-sh/nvm) to manage versions)
- npm or bun package manager
- OpenAI API key (optional, for AI features)
- Supabase account (optional, for cloud sync & auth)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd SimplyFuel

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .en:
#   - OPENAI_API_KEY (for AI features)
#   - VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (for auth & cloud sync)
# Edit .env and add your OPENAI_API_KEY

# Start development server
npm run dev
```

VisiOptional Setup Guides

**AI Features (OpenAI GPT-4o-mini):**
- The app works without an API key using local keyword matching
- For full AI-powered meal analysis, see **[AI_SETUP.md](AI_SETUP.md)**

**Authentication & Cloud Sync (Supabase):**
- The app works in guest mode with localStorage only
- FoDatabase**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **r multi-device sync and user accounts, see **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** meal analysis. To enable full AI features, get an API key from [OpenAI](https://platform.openai.com/api-keys).

See **[AI_SETUP.md](AI_SETUP.md)** for detailed AI configuration.

## 📦 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React SSR)
- **AI**: [OpenAI GPT-4o-mini](https://platform.openai.com/) (meal analysis)
- **Serverless**: [Vercel Functions](https://vercel.com/docs/functions) (API endpoints)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/) with persistence
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)

## 📁upabase/
│   └── schema.sql          # Database schema & RLS policies
├── src/
│   ├── routes/             # File-based routing
│   │   ├── __root.tsx     # App shell with AuthProvider
│   │   ├── index.tsx      # Home dashboard
│   │   ├── history.tsx    # Meal history
│   │   ├── progress.tsx   # Analytics
│   │   └── profile.tsx    # User settings & auth
│   ├── components/
│   │   ├── log-meal-modal.tsx  # Main meal logging UI
│   │   ├── auth-modal.tsx      # Sign-in/sign-up form
│   │   ├── bottom-nav.tsx      # Mobile navigation
│   │   └── ui/                 # Shadcn UI components
│   ├── data/
│   │   └── foods.json     # Food nutrition database
│   ├── lib/
│   │   ├── supabase.ts    # Supabase client & types
│   │   ├── auth-context.tsx # Auth state management
│   │   ├── store.ts       # Zustand state + Supabase sync
│   │   ├── mock-ai.ts     # API client
│   │   └── utils.ts       # Helper functions
│   └── hooks/             # Custom React hooks
├── .env.example           # Environment template
├── vercel.json            # Vercel deployment config
├── AI_SETUP.md            # AI configuration guide
├── SUPABASE_SETUP.md      # Database & auth setupnagement
│   │   ├── mock-ai.ts     # API client
│   │   └── utils.ts       # Helper functions
│   └── hooks/             # Custom React hooks
├── .env.example           # Environment template
├── vercel.json            # Vercel deployment config
├── AI_SETUP.md            # AI configuration guide
└── DEPLOYMENT.md          # Deployment instructions
```environment variables:
   - `OPENAI_API_KEY` (optional, for AI)
   - `VITE_SUPABASE_URL` (optional, for cloud sync)
   - `VITE_SUPABASE_ANON_KEY` (optional, for cloud sync)

## 🚀 Deployment

This app is optimized for [Vercel](https://vercel.com) deployment with serverless functions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import to Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy!

**Detailed guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## 🛠️ Available Scripts

```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

## 🎨 Styling Guide

The app uses Tailwind CSS with custom design tokens:

- **Responsive**: Mobile-first with `max-w-md` container
- **Colors**: CSS variable-based theming
- **Components**: Rounded cards (`rounded-3xl`), soft shadows
- **Typography**: Tight tracking for headings, muted text for secondary content

Example:
```tsx
<div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
  <h2 className="text-2xl font-semibold tracking-tight">Title</h2>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

## 🔧 Configuration

# AI Features (optional)
OPENAI_API_KEY=sk-proj-your-key-here

# Cloud Sync & Auth (optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon
Use `@/` to import from `src/`:
```typescript
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
```

### Environment Variables
Create a `.env` file (optional):
```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

Without an API key, the app uses local keyword matching for meal analysis.

## 📱 Current Features

### ✅ Implemented
- **AI-powered meal analysis** using GPT-4o-mini
- Natural language meal logging
- Macro tracking (calories, protein, carbs, fat)
- Daily nutrition goals with progress visualization
- Meal history view with delete functionality
- **Food nutrition database** (18+ items)
- **Smart fallback** - works without API key
- Persistent storage (localStorage via Zustand)
- Mobile-first responsive design
- Dark mode ready (CSS variables)

### 🚧 Coming Soon
- Photo-based meal logging
- Weekly/monthly progress charts
- Weight tracking
- Barcode scanner for packaged foods
- Voice input for meal descriptions
- User authentication
- Social features (share progress)
- Custom food database entries

## 🤝 Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for development guidelines.

Key conventions:
- TypeScript strict mode
- Functional React components
- File-based routing (TanStack Router)
- Mobile-first responsive design
- Accessible UI (Radix primitives)

## 📄 License

[Your License Here]

## 🔗 Links

- [TanStack Start Docs](https://tanstack.com/start/latest)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Built with ❤️ using modern web technologies
