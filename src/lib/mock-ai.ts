/**
 * AI-powered meal analysis
 * Calls the OpenAI API via server endpoint
 * Falls back to local analysis if API is unavailable
 */

export type AnalyzedFood = {
  name: string;
  quantity: number;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealAnalysis = {
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  foods: AnalyzedFood[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
};

/**
 * Analyze meal description using AI
 * @param input Natural language meal description (e.g., "2 eggs and toast")
 * @returns Structured nutrition data
 */
export async function analyzeMeal(input: string): Promise<MealAnalysis> {
  try {
    const response = await fetch("/api/analyze-meal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result as MealAnalysis;
  } catch (error) {
    console.error("Error calling analyze API:", error);
    throw error;
  }
}
