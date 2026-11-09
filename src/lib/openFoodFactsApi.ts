import type { Food, FoodCategory } from '../types';

const BASE = 'https://world.openfoodfacts.org/cgi/search.pl';
const FIELDS = 'product_name,nutriments,categories_tags,countries_tags';

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  'energy_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
}

interface OFFProduct {
  code?: string;
  product_name?: string;
  nutriments?: OFFNutriments;
  categories_tags?: string[];
}

interface OFFResponse {
  count: number;
  products: OFFProduct[];
}

function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

function mapCategory(tags?: string[]): FoodCategory {
  if (!tags?.length) return 'otros';
  const joined = tags.join(' ');
  if (/meat|beef|pork|chicken|turkey|lamb|poultry|charcuter|sausage/.test(joined)) return 'carnes';
  if (/fish|seafood|salmon|tuna|cod|shrimp|shellfish/.test(joined)) return 'pescados';
  if (/egg/.test(joined)) return 'huevos';
  if (/dairy|milk|cheese|yogurt|cream|butter/.test(joined)) return 'lacteos';
  if (/legume|bean|lentil|chickpea|pea|soy/.test(joined)) return 'legumbres';
  if (/cereal|grain|bread|pasta|rice|flour|oat/.test(joined)) return 'cereales';
  if (/vegetable|veggie/.test(joined)) return 'verduras';
  if (/fruit|juice/.test(joined)) return 'frutas';
  if (/nut|seed/.test(joined)) return 'frutos_secos';
  if (/oil|fat/.test(joined)) return 'aceites';
  return 'otros';
}

export function convertOFFProduct(p: OFFProduct): Food | null {
  const name = p.product_name?.trim();
  if (!name) return null;

  const n = p.nutriments ?? {};
  const kcalRaw = n['energy-kcal_100g'] ?? (n['energy_100g'] != null ? n['energy_100g'] / 4.184 : null);
  const protein = n.proteins_100g ?? 0;
  const carbs = n.carbohydrates_100g ?? 0;
  const fat = n.fat_100g ?? 0;
  const fiber = n.fiber_100g ?? 0;

  if (protein === 0 && carbs === 0 && fat === 0) return null;

  const kcal = kcalRaw != null ? Math.round(kcalRaw) : Math.round(4 * protein + 4 * carbs + 9 * fat);

  const id = `off_${p.code ?? Math.random().toString(36).slice(2)}`;

  return {
    id,
    name,
    baseName: name,
    category: mapCategory(p.categories_tags),
    per100g: {
      kcal,
      protein: r1(protein),
      carbs: r1(carbs),
      fat: r1(fat),
      ...(fiber > 0 ? { fiber: r1(fiber) } : {}),
    },
    source: 'custom',
  };
}

export async function searchOpenFoodFacts(query: string): Promise<Food[]> {
  const url = new URL(BASE);
  url.searchParams.set('search_terms', query);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('fields', FIELDS);
  url.searchParams.set('page_size', '15');
  url.searchParams.set('lc', 'es');

  const res = await fetch(url.toString());
  if (res.status === 429) throw new Error('rate_limit');
  if (!res.ok) throw new Error(`off_error_${res.status}`);

  const data: OFFResponse = await res.json();
  return (data.products ?? [])
    .map(convertOFFProduct)
    .filter((f): f is Food => f !== null);
}
