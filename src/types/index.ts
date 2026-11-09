export type FoodCategory =
  | 'carnes'
  | 'pescados'
  | 'huevos'
  | 'lacteos'
  | 'legumbres'
  | 'cereales'
  | 'verduras'
  | 'frutas'
  | 'frutos_secos'
  | 'aceites'
  | 'otros';

export interface FoodNutrients {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface Food {
  id: string;
  name: string;
  baseName: string;
  variant?: 'cruda' | 'cocinada';
  category: FoodCategory;
  per100g: FoodNutrients;
  source: 'USDA' | 'custom';
  fdcId?: number;
}

export type MealType = 'desayuno' | 'comida' | 'merienda' | 'cena' | 'otros';

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  type: 'food';
  date: string;
  meal: MealType;
  foodId: string;
  foodName: string;
  grams: number;
  macros: Macros;
  createdAt: number;
}

export interface ManualEntry {
  id: string;
  type: 'manual';
  date: string;
  meal: MealType;
  label?: string;
  macros: Macros;
  createdAt: number;
}

export type DiaryEntry = FoodEntry | ManualEntry;

export interface Goals {
  id?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecentFood {
  foodId: string;
  lastUsed: number;
  useCount: number;
}

export const MEAL_LABELS: Record<MealType, string> = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena',
  otros: 'Otros',
};

export const MEAL_ORDER: MealType[] = ['desayuno', 'comida', 'merienda', 'cena', 'otros'];

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  carnes: 'Carnes',
  pescados: 'Pescados',
  huevos: 'Huevos',
  lacteos: 'Lácteos',
  legumbres: 'Legumbres',
  cereales: 'Cereales',
  verduras: 'Verduras',
  frutas: 'Frutas',
  frutos_secos: 'Frutos secos',
  aceites: 'Aceites',
  otros: 'Otros',
};
