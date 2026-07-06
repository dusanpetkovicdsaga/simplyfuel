# Vercel Deployment Guide

## 🚀 Quick Deploy

### Method 1: Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add AI meal analysis"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel auto-detects the configuration

3. **Set Environment Variables**
   - In project settings → "Environment Variables"
   - Add: `OPENAI_API_KEY` = `sk-proj-your-key`
   - Apply to: Production, Preview, Development
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app is live! 🎉

---

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - What's your project's name? simplyfuel
# - In which directory is your code? ./
# - Want to override settings? N

# Add environment variable
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key when prompted
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

---

## 📁 Project Structure

```
SimplyFuel/
├── api/                      # Vercel Serverless Functions
│   └── analyze-meal.ts       # AI meal analysis endpoint
├── src/
│   ├── data/
│   │   └── foods.json        # Food nutrition database
│   ├── lib/
│   │   └── mock-ai.ts        # Client API caller
│   └── routes/               # TanStack Start routes
├── .env                      # Local environment (DO NOT COMMIT)
├── .env.example              # Environment template
├── vercel.json               # Vercel configuration
└── package.json
```

---

## 🔧 Configuration Details

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "framework": null,
  "installCommand": "npm install",
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**Configuration Explained:**
- `memory: 1024` - 1GB RAM for OpenAI API calls
- `maxDuration: 10` - 10 second timeout (OpenAI usually responds in 1-2s)

---

## 🌍 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for meal analysis | `sk-proj-abc123...` |

### Setting Variables in Vercel

**Via Dashboard:**
1. Project → Settings → Environment Variables
2. Add key-value pairs
3. Select environments (Production/Preview/Development)

**Via CLI:**
```bash
vercel env add OPENAI_API_KEY
```

**Local Development:**
Create `.env` file:
```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

---

## 🧪 Testing Deployment

### Test API Endpoint

Once deployed, test your API:

```bash
# Replace YOUR_DOMAIN with your Vercel URL
curl -X POST https://YOUR_DOMAIN.vercel.app/api/analyze-meal \
  -H "Content-Type: application/json" \
  -d '{"input": "2 eggs and toast"}'
```

Expected response:
```json
{
  "mealType": "Breakfast",
  "foods": [
    {
      "name": "Eggs",
      "quantity": 2,
      "grams": 100,
      "calories": 156,
      "protein": 12,
      "carbs": 2,
      "fat": 10
    },
    ...
  ],
  "totals": { ... }
}
```

---

## 📊 Monitoring

### View Logs

**Vercel Dashboard:**
- Project → Deployments → Click deployment
- View "Function Logs" tab
- See API requests and errors in real-time

**CLI:**
```bash
vercel logs
```

### Performance

- **Cold Start**: ~1-2 seconds (first request)
- **Warm Start**: ~200-500ms (subsequent requests)
- **OpenAI API**: ~800-1500ms average response time

---

## 🐛 Troubleshooting

### API Returns 500 Error

**Check:**
1. Environment variables are set correctly
2. OpenAI API key is valid and has credits
3. Function logs in Vercel dashboard

**Fix:**
```bash
# Verify env vars are set
vercel env ls

# Re-add if missing
vercel env add OPENAI_API_KEY
```

### "Module not found" Errors

**Issue:** Dependencies not installed

**Fix:**
```bash
# Clear build cache
vercel --force

# Or redeploy
git commit --allow-empty -m "Trigger rebuild"
git push
```

### OpenAI Timeout

**Issue:** API calls taking too long

**Fix:** Increase `maxDuration` in `vercel.json`:
```json
"functions": {
  "api/**/*.ts": {
    "maxDuration": 15
  }
}
```

### CORS Errors (if using external domain)

**Add to** `api/analyze-meal.ts`:
```typescript
// Add headers before returning response
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

---

## 💡 Pro Tips

1. **Use Preview Deployments**
   - Every git push creates a preview URL
   - Test changes before merging to production

2. **Environment Variables Per Environment**
   - Use different API keys for production vs preview
   - Track usage separately

3. **Monitor Costs**
   - Set up OpenAI usage alerts
   - Monitor Vercel function invocations
   - Expected cost: ~$0.0003 per meal analysis

4. **Edge Caching** (Future optimization)
   - Cache common meal analyses
   - Reduce API calls for popular items

---

## 🔐 Security Checklist

- [x] `.env` added to `.gitignore`
- [x] API key stored in Vercel environment variables
- [x] No secrets in source code
- [ ] Set up rate limiting (recommended for production)
- [ ] Add user authentication (if making it public)
- [ ] Monitor API usage and costs

---

## 📈 Scaling Considerations

**Current Setup (Hobby Plan):**
- ✅ Good for personal use
- ✅ Handles ~100 requests/day easily
- ⚠️ 100GB bandwidth limit
- ⚠️ 100 GB-hours compute limit

**If Growing:**
- Consider Pro plan ($20/mo) for more resources
- Add Redis caching for common meals
- Implement rate limiting per user
- Consider batch processing for multiple users

---

## 🎯 Next Steps After Deployment

1. Share your app URL
2. Test on mobile devices
3. Monitor logs for any errors
4. Track OpenAI usage costs
5. Collect user feedback
6. Add more foods to database

---

**Questions?** Check Vercel docs: https://vercel.com/docs/functions/serverless-functions
