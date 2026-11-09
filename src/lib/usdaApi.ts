/**
 * USDA FoodData Central API client
 * Docs: https://fdc.nal.usda.gov/api-guide.html
 * Free API key: https://fdc.nal.usda.gov/api-key-signup.html
 * DEMO_KEY: 30 requests/hour, 50/day
 */

import type { Food, FoodCategory } from '../types';
import { translateQueryToEnglish } from './foodTranslations';

export const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
export const USDA_DEMO_KEY = 'DEMO_KEY';

// Nutrient IDs in USDA FoodData Central
const NID = {
  kcal: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fiber: 1079,
} as const;

interface USDANutrient {
  nutrientId: number;
  value: number;
}

interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodCategory?: string;
  foodNutrients: USDANutrient[];
}

interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
}

function getNutrient(nutrients: USDANutrient[], id: number): number {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

function mapCategory(cat?: string): FoodCategory {
  if (!cat) return 'otros';
  const c = cat.toLowerCase();
  if (/beef|pork|lamb|chicken|turkey|veal|game|sausage|poultry|meat|bacon|ham/.test(c)) return 'carnes';
  if (/fish|seafood|shellfish|salmon|tuna|cod|shrimp|crab|lobster/.test(c)) return 'pescados';
  if (/egg/.test(c)) return 'huevos';
  if (/dairy|milk|cheese|yogurt|cream|butter/.test(c)) return 'lacteos';
  if (/legume|bean|lentil|chickpea|pea|soy|tofu/.test(c)) return 'legumbres';
  if (/cereal|grain|bread|pasta|rice|flour|oat|wheat/.test(c)) return 'cereales';
  if (/vegetable|veggie/.test(c)) return 'verduras';
  if (/fruit|juice/.test(c)) return 'frutas';
  if (/nut|seed/.test(c)) return 'frutos_secos';
  if (/oil|fat|lard/.test(c)) return 'aceites';
  return 'otros';
}

export function convertUSDAFood(usdaFood: USDAFood): Food {
  const { fdcId, description, foodCategory, foodNutrients } = usdaFood;

  const kcal = getNutrient(foodNutrients, NID.kcal);
  const protein = getNutrient(foodNutrients, NID.protein);
  const carbs = getNutrient(foodNutrients, NID.carbs);
  const fat = getNutrient(foodNutrients, NID.fat);
  const fiber = getNutrient(foodNutrients, NID.fiber);

  const name = description
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(', ');

  return {
    id: `usda_${fdcId}`,
    name,
    baseName: name,
    category: mapCategory(foodCategory),
    per100g: {
      kcal: Math.round(kcal),
      protein: r1(protein),
      carbs: r1(carbs),
      fat: r1(fat),
      ...(fiber > 0 ? { fiber: r1(fiber) } : {}),
    },
    source: 'USDA',
    fdcId,
  };
}

export async function searchUSDA(query: string, apiKey = USDA_DEMO_KEY): Promise<Food[]> {
  const url = new URL(`${USDA_BASE_URL}/foods/search`);
  url.searchParams.set('query', translateQueryToEnglish(query));
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('dataType', 'Foundation,SR Legacy');
  url.searchParams.set('pageSize', '15');
  url.searchParams.set('sortBy', 'dataType.keyword');
  url.searchParams.set('sortOrder', 'asc');

  const res = await fetch(url.toString());

  if (res.status === 429) throw new Error('rate_limit');
  if (!res.ok) throw new Error(`usda_error_${res.status}`);

  const data: USDASearchResponse = await res.json();
  return (data.foods ?? []).map(convertUSDAFood);
}
