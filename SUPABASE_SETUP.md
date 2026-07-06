# Supabase Setup Guide

This guide walks you through setting up Supabase for authentication and persistent data storage in SimplyFuel.

## 📋 Overview

**What you're adding:**
- **PostgreSQL Database**: Store user profiles, meals, and meal items
- **Authentication**: User sign-up, sign-in, and session management
- **Row-Level Security (RLS)**: Automatic data isolation per user
- **Real-time Sync**: Data syncs across devices when logged in

**Current State → Future State:**
- localStorage only → localStorage + Supabase cloud sync
- Guest mode → Optional sign-in with cloud backup
- Single device → Multi-device sync

---

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `simplyfuel` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Free tier (includes 500MB database, 50K MAU)
4. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings** (gear icon in sidebar) → **API**
2. Find these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (long string starting with `eyJ`)
3. Copy both values

### Step 3: Add to Environment Variables

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```env
   # OpenAI (already configured)
   OPENAI_API_KEY=sk-proj-...

   # Supabase (NEW - add these)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Important:** Never commit `.env` to git (it's already in `.gitignore`)

### Step 4: Create Database Schema

1. In Supabase Dashboard, go to **SQL Editor** (in sidebar)
2. Click **"New query"**
3. Copy the entire contents of `supabase/schema.sql` from your project
4. Paste into the SQL editor
5. Click **"Run"** (bottom right)
6. You should see: ✅ "SimplyFuel schema created successfully!"

**What this creates:**
- `profiles` table (user goals and preferences)
- `meals` table (meal records with type and timestamp)
- `meal_items` table (individual food items in each meal)
- RLS policies (users can only see their own data)
- Auto-profile creation trigger (creates profile on signup)
- Helper views for aggregated nutrition data

### Step 5: Test the Integration

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Go to **Profile** tab
4. Click **"Sign In"**
5. Click **"Create Account"** and fill in:
   - Name: Your name
   - Email: your@email.com
   - Password: (min 6 characters)
6. Check your email for verification link (check spam folder)
7. Click the verification link
8. Return to the app and sign in

**✅ Success checklist:**
- [ ] Profile page shows "Signed In" with your email
- [ ] Cloud icon appears (not CloudOff)
- [ ] Meals sync across page refreshes
- [ ] No console errors related to Supabase

---

## 🏗️ Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         User Action                         │
│                    (Log Meal, Update Profile)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Zustand Store │ ◄─── Optimistic Update (instant UI)
            │  (localStorage) │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │   Supabase DB  │ ◄─── Background Sync (persists to cloud)
            │   (PostgreSQL) │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │  Other Devices │ ◄─── Auto-sync on next load
            └────────────────┘
```

### Key Components

**1. Supabase Client** (`src/lib/supabase.ts`)
- Initializes Supabase connection
- Handles auth state persistence
- Provides TypeScript types for database tables

**2. Auth Context** (`src/lib/auth-context.tsx`)
- Manages user authentication state
- Provides `signUp`, `signIn`, `signOut` methods
- Auto-loads user session on app start

**3. Store Integration** (`src/lib/store.ts`)
- **Optimistic updates**: Changes appear instantly in UI
- **Background sync**: Saves to Supabase asynchronously
- **Load on auth**: Fetches cloud data when user signs in
- **Graceful degradation**: Works offline, syncs when online

**4. UI Components**
- `AuthModal`: Sign-in/sign-up form with validation
- Profile page: Shows auth status, sign-in/out button
- All pages: Auto-sync meals when authenticated

### Database Schema

```
profiles                    meals                       meal_items
┌──────────────┐           ┌──────────────┐           ┌──────────────┐
│ id (PK)      │◄──┐       │ id (PK)      │◄──┐       │ id (PK)      │
│ email        │   │       │ user_id (FK) │   └───────│ meal_id (FK) │
│ name         │   └───────│ meal_type    │           │ name         │
│ daily_...    │           │ created_at   │           │ quantity     │
│ protein_goal │           └──────────────┘           │ grams        │
│ carbs_goal   │                                      │ calories     │
│ fat_goal     │                                      │ protein      │
│ created_at   │                                      │ carbs        │
│ updated_at   │                                      │ fat          │
└──────────────┘                                      └──────────────┘
```

**Row Level Security (RLS) Rules:**
- Users can only SELECT/INSERT/UPDATE/DELETE their own data
- `user_id` automatically filtered to `auth.uid()` in all queries
- No manual authorization checks needed in your code

---

## 🔒 Security

### Row Level Security (RLS)

**What it does:**
- Automatically filters all database queries by authenticated user
- Prevents users from seeing or modifying other users' data
- Enforced at the database level (cannot be bypassed from client)

**Example:**
```sql
-- Your code:
SELECT * FROM meals;

-- What RLS executes:
SELECT * FROM meals WHERE user_id = auth.uid();
```

### Authentication Flow

1. **Sign Up**
   ```
   User → Supabase Auth → Email Verification → Profile Auto-Created
   ```

2. **Sign In**
   ```
   User → Supabase Auth → JWT Token → Stored in localStorage
   ```

3. **Session Persistence**
   - JWT stored in `localStorage` (key: `sb-*`)
   - Auto-refreshes before expiration
   - Survives page reloads

4. **Sign Out**
   ```
   User → Clear JWT → Redirect to Guest Mode
   ```

### Best Practices

✅ **DO:**
- Keep `VITE_SUPABASE_ANON_KEY` in `.env` (it's safe for client-side)
- Use RLS policies for all tables
- Validate user input before saving
- Handle auth errors gracefully

❌ **DON'T:**
- Commit `.env` to version control
- Share your database password
- Disable RLS (defeats the purpose!)
- Trust client-side data without validation

---

## 🧪 Testing

### Manual Test Checklist

**Guest Mode (Not Signed In):**
- [ ] Can log meals (saved to localStorage only)
- [ ] Can update profile (localStorage only)
- [ ] Data persists on page refresh
- [ ] See "Local Only" status in Profile

**Authenticated Mode:**
- [ ] Can sign up with email
- [ ] Receive verification email
- [ ] Can sign in after verification
- [ ] Profile loads from Supabase
- [ ] Meals sync to Supabase automatically
- [ ] See "Signed In" status with email
- [ ] Can sign out (returns to guest mode)

**Multi-Device Sync:**
- [ ] Sign in on Device A
- [ ] Log a meal on Device A
- [ ] Sign in on Device B (same account)
- [ ] Meal appears on Device B

### SQL Queries for Testing

**Check user profiles:**
```sql
SELECT * FROM profiles;
```

**Check meals:**
```sql
SELECT m.*, 
       (SELECT json_agg(mi.*) FROM meal_items mi WHERE mi.meal_id = m.id) as items
FROM meals m
ORDER BY m.created_at DESC;
```

**Check aggregated view:**
```sql
SELECT * FROM meals_with_totals
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### "Failed to create project"
**Cause:** Supabase free tier has a limit (2 projects per account)
**Solution:** Delete an unused project or upgrade plan

### "Invalid API key"
**Cause:** Wrong key copied or not in `.env`
**Solution:** 
1. Go to Supabase → Settings → API
2. Copy **anon public key** (not service_role!)
3. Update `VITE_SUPABASE_ANON_KEY` in `.env`
4. Restart dev server: `npm run dev`

### "User already registered"
**Cause:** Email already used
**Solution:** 
- Use a different email, or
- Go to Supabase → Authentication → Users → Delete user

### "Email not confirmed"
**Cause:** Clicked sign-in before verifying email
**Solution:**
1. Check your email (including spam)
2. Click verification link
3. Return to app and sign in

### Console error: "relation 'profiles' does not exist"
**Cause:** Database schema not created
**Solution:**
1. Go to Supabase → SQL Editor
2. Run `supabase/schema.sql`
3. Verify success message appears

### Meals not syncing
**Check:**
1. Open DevTools → Console (any errors?)
2. Go to Profile → Is "Signed In" showing?
3. Check Supabase → Database → meals table (any rows?)
4. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`

### Data not loading after sign-in
**Solution:**
1. Open DevTools → Application → Local Storage
2. Clear `kal-store-v1` key
3. Refresh page
4. Sign in again (should load from Supabase)

---

## 📊 Monitoring & Analytics

### Supabase Dashboard

**Database Usage:**
- Go to **Settings** → **Billing** → **Usage**
- See: Database size, API requests, Auth users

**Recent Activity:**
- Go to **Database** → **Tables** → Select table
- View recent inserts/updates

**Auth Activity:**
- Go to **Authentication** → **Users**
- See: Sign-ups, last sign-in times

**Logs (Errors & Performance):**
- Go to **Logs** → **API Logs**
- Filter by status code (500 = errors)

### Free Tier Limits

| Resource         | Limit              | Notes                          |
|------------------|--------------------|--------------------------------|
| Database         | 500 MB             | ~500K meal records             |
| Storage          | 1 GB               | (we're not using file storage) |
| Monthly Users    | 50,000 MAU         | Active users per month         |
| API Requests     | Unlimited          | (with reasonable use)          |
| Bandwidth        | 5 GB               | Data transfer out              |

**What happens when you exceed?**
- Database full: New writes fail
- MAU exceeded: Rate limiting
- Solution: Upgrade to Pro ($25/month) or optimize queries

---

## 🚀 Deployment

### Vercel Configuration

Add these environment variables in Vercel Dashboard:

1. Go to [vercel.com](https://vercel.com) → Your project → **Settings** → **Environment Variables**
2. Add:
   ```
   OPENAI_API_KEY = sk-proj-...
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   ```
3. Redeploy: `git push` or click "Redeploy" in Vercel

### Domain Configuration (Optional)

If you want to use a custom domain for Supabase:

1. Supabase → **Settings** → **Custom Domains** (Pro plan required)
2. Add CNAME record: `db.yourdomain.com → your-project.supabase.co`

---

## 🎯 Next Steps

### Phase 1: Core Functionality (✅ Done)
- [x] User authentication (sign-up, sign-in, sign-out)
- [x] Profile sync
- [x] Meal sync with optimistic updates
- [x] Multi-device support

### Phase 2: Enhancements (Future)
- [ ] Social sign-in (Google, Apple)
- [ ] Email-based password reset
- [ ] Real-time sync (subscribe to changes)
- [ ] Offline mode with sync queue
- [ ] Data export (CSV/JSON)
- [ ] Account deletion flow

### Phase 3: Advanced Features (Future)
- [ ] Team accounts (share meals with family)
- [ ] Public meal templates
- [ ] Nutritionist dashboard (view client data)
- [ ] Backup/restore functionality

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [TanStack Start + Supabase](https://supabase.com/docs/guides/getting-started/tutorials)

---

## 💬 Support

**Issues?**
1. Check troubleshooting section above
2. Search [Supabase Discussions](https://github.com/supabase/supabase/discussions)
3. Open an issue in this repo

**Questions about this integration?**
- Review the code comments in `src/lib/supabase.ts`
- Check the SQL comments in `supabase/schema.sql`
- Read the store integration in `src/lib/store.ts`

---

**🎉 You're all set!** Your app now has production-ready authentication and cloud sync.
