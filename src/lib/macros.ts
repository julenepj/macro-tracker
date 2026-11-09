import type { Food, Macros } from '../types';

export function calcMacrosFromGrams(food: Food, grams: number): Macros {
  const factor = grams / 100;
  return {
    kcal: food.per100g.kcal * factor,
    protein: food.per100g.protein * factor,
    carbs: food.per100g.carbs * factor,
    fat: food.per100g.fat * factor,
  };
}

export function calcMacrosFromManual(protein: number, carbs: number, fat: number): Macros {
  return {
    kcal: protein * 4 + carbs * 4 + fat * 9,
    protein,
    carbs,
    fat,
  };
}

export function calcMacrosFromPercentages(
  kcal: number,
  pctProtein: number,
  pctCarbs: number,
  pctFat: number
): { macros: Macros; error?: string } {
  const sum = pctProtein + pctCarbs + pctFat;
  if (Math.abs(sum - 100) > 0.5) {
    return {
      macros: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      error: `Los porcentajes deben sumar 100% (ahora suman ${sum.toFixed(1)}%)`,
    };
  }
  const protein = (kcal * (pctProtein / 100)) / 4;
  const carbs = (kcal * (pctCarbs / 100)) / 4;
  const fat = (kcal * (pctFat / 100)) / 9;
  return {
    macros: { kcal, protein, carbs, fat },
  };
}

export function sumMacros(entries: Macros[]): Macros {
  return entries.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function formatMacro(value: number): string {
  return value.toFixed(1);
}

export function formatKcal(value: number): string {
  return Math.round(value).toString();
}
