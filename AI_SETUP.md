# AI Meal Analysis Setup Guide

This project now uses **OpenAI GPT-4o-mini** for intelligent meal analysis with automatic fallback to local keyword matching.

## 🚀 Quick Start

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

### 2. Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your key
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎯 How It Works

### Architecture

```
User Input → Client (log-meal-modal.tsx)
              ↓
         analyzeMeal() (mock-ai.ts)
              ↓
    Vercel Serverless Function (/api/analyze-meal.ts)
              ↓
         OpenAI GPT-4o-mini
              ↓
    Structured Nutrition Data
              ↓
         Response to Client
```

### Features

✅ **AI-Powered Analysis**: Natural language understanding  
✅ **Food Database**: 18+ common foods with accurate nutrition data  
✅ **Smart Matching**: AI uses database when foods are recognized  
✅ **Fallback System**: Works without API key (local keyword matching)  
✅ **Type-Safe**: Full TypeScript support  
✅ **Secure**: API key never exposed to client  

## 📁 File Structure

```
src/
├── data/
│   └── foods.json           # Food database (18 items)
├── lib/
│   └── mock-ai.ts           # Client API caller
├── routes/                  # TanStack Start routes
└── components/
    └── log-meal-modal.tsx   # UI component

api/                         # Vercel Serverless Functions
└── analyze-meal.ts          # AI meal analysis endpoint
```

## 🔧 Development

### Testing the API

```bash
# Test with curl
curl -X POST http://localhost:3000/api/analyze-meal \
  -H "Content-Type: application/json" \
  -d '{"input": "2 eggs and toast"}'
```

### Adding Foods to Database

Edit `src/data/foods.json`:

```json
{
  "id": "newFood",
  "name": "Display Name",
  "keywords": ["keyword1", "keyword2"],
  "servingSize": { "amount": 1, "unit": "serving" },
  "grams": 100,
  "calories": 200,
  "protein": 10,
  "carbs": 20,
  "fat": 5,
  "tags": ["category1"]
}
```

### Fallback Behavior

**Without API Key:**
- Uses local keyword matching
- Matches against food database keywords
- Still provides nutrition data
- Shows "usingMock: true" in response

**With API Key:**
- Uses GPT-4o-mini for analysis
- Understands complex descriptions
- Better at handling variations
- More accurate portion estimation

## 💰 Cost Estimation

**OpenAI GPT-4o-mini Pricing:**
- Input: $0.150 / 1M tokens (~$0.0002 per meal)
- Output: $0.600 / 1M tokens (~$0.0001 per meal)
- **Total: ~$0.0003 per meal analysis**

**Example Usage:**
- 1,000 meals = ~$0.30
- 10,000 meals = ~$3.00
- 100,000 meals = ~$30.00

## 🔒 Security

- ✅ API key stored in `.env` (never in code)
- ✅ `.env` added to `.gitignore`
- ✅ Server-side API calls only
- ✅ Client never sees API key
- ✅ Rate limiting recommended for production

## 🚨 Troubleshooting

### "OPENAI_API_KEY not set"
- Check `.env` file exists in project root
- Verify key starts with `sk-proj-`
- Restart dev server after adding key

### API Returns Mock Data
- API key might be invalid
- Check console for error messages
- Verify OpenAI account has credits
- Test with curl command above

### Foods Not Recognized
- Add keywords to `foods.json`
- AI should still estimate unknown foods
- Check network tab for API response

## 📝 Next Steps

1. **Add More Foods**: Expand `foods.json` database
2. **User Preferences**: Remember frequently eaten meals
3. **Photo Upload**: Add image-based meal analysis
4. **Voice Input**: Implement speech-to-text
5. **Barcode Scanner**: Scan packaged foods
6. **Custom Foods**: Let users add their own items

## 🤝 Contributing

To improve the food database:
1. Add entries to `src/data/foods.json`
2. Include multiple keywords for better matching
3. Use accurate USDA nutrition data when possible
4. Test with common meal descriptions

---

**Need Help?** Check the console logs for detailed error messages.
