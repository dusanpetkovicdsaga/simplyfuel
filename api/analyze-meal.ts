import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";

// Load foods database at runtime to avoid import-assertion issues in ESM
const foodsData = JSON.parse(
  readFileSync(join(process.cwd(), "src", "data", "foods.json"), "utf-8"),
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { input } = req.body;

    if (!input?.trim()) {
      return res.status(400).json({ error: "Input is required" });
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn("OPENAI_API_KEY not set, using mock analysis");
      const mockResult = await mockAnalysis(input);
      return res.status(200).json(mockResult);
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Create system prompt with food database context
    const systemPrompt = `You are a nutrition expert AI that analyzes meal descriptions and returns structured nutrition data.

FOOD DATABASE (use these for accurate nutrition data when possible):
${JSON.stringify(
  foodsData.foods.map((f) => ({
    name: f.name,
    keywords: f.keywords,
    serving: f.servingSize,
    per_serving: {
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      grams: f.grams,
    },
  })),
  null,
  2,
)}

INSTRUCTIONS:
1. Parse the user's meal description into individual food items
2. Try to match foods to the database above when possible
3. Estimate reasonable quantities if not specified (e.g., "2 eggs" = 2x serving)
4. For foods not in database, provide reasonable estimates based on nutrition knowledge
5. Return a JSON object with this exact structure:

{
  "mealType": "Breakfast" | "Lunch" | "Dinner" | "Snacks",
  "foods": [
    {
      "name": "Food Name",
      "quantity": 1,
      "grams": 100,
      "calories": 200,
      "protein": 10,
      "carbs": 20,
      "fat": 5
    }
  ],
  "totals": {
    "calories": 200,
    "protein": 10,
    "carbs": 20,
    "fat": 5
  }
}

RULES:
- quantity is the number of servings/items (e.g., 2 eggs, 1 slice)
- grams is total weight for that quantity
- All nutrition values are totals for the quantity specified
- Calculate totals by summing all foods
- Detect meal type based on time of day or food context
- Round all numbers to 1 decimal place`;

    const userPrompt = `Analyze this meal: "${input}"`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);

    // Validate and ensure correct structure
    if (!result.foods || !Array.isArray(result.foods)) {
      throw new Error("Invalid response structure from AI");
    }

    // Ensure totals are calculated
    const totals = result.foods.reduce(
      (acc: any, food: any) => ({
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    result.totals = totals;

    // Ensure mealType is set
    if (!result.mealType) {
      result.mealType = detectMealType();
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error analyzing meal:", error);

    // Fallback to mock on error
    try {
      const mockResult = await mockAnalysis(req.body.input);
      return res.status(200).json(mockResult);
    } catch (fallbackError) {
      return res.status(500).json({
        error: "Failed to analyze meal",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

// Fallback mock analysis
async function mockAnalysis(input: string) {
  const text = input.toLowerCase();
  const foods: any[] = [];

  // Simple keyword matching from database
  for (const food of foodsData.foods) {
    for (const keyword of food.keywords) {
      if (text.includes(keyword)) {
        const qty = parseQuantity(text, keyword);
        foods.push({
          name: food.name,
          quantity: qty,
          grams: food.grams * qty,
          calories: food.calories * qty,
          protein: food.protein * qty,
          carbs: food.carbs * qty,
          fat: food.fat * qty,
        });
        break; // Only match once per food
      }
    }
  }

  // Default if nothing matched
  if (foods.length === 0) {
    foods.push({
      name: input.trim() || "Meal",
      quantity: 1,
      grams: 200,
      calories: 400,
      protein: 20,
      carbs: 40,
      fat: 15,
    });
  }

  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return {
    mealType: detectMealType(),
    foods,
    totals,
    usingMock: true,
  };
}

function parseQuantity(text: string, keyword: string): number {
  const numWords: Record<string, number> = {
    a: 1,
    an: 1,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
  };

  const idx = text.indexOf(keyword);
  if (idx === -1) return 1;

  const before = text
    .slice(Math.max(0, idx - 20), idx)
    .trim()
    .split(/\s+/);
  const last = before[before.length - 1];
  if (!last) return 1;

  const n = parseInt(last, 10);
  if (!Number.isNaN(n)) return n;

  return numWords[last.toLowerCase()] ?? 1;
}

function detectMealType() {
  const h = new Date().getHours();
  if (h < 11) return "Breakfast";
  if (h < 15) return "Lunch";
  if (h < 21) return "Dinner";
  return "Snacks";
}
