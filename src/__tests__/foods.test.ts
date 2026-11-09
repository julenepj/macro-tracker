import { describe, it, expect } from 'vitest';
import foods from '../data/foods.json';
import type { Food } from '../types';

const TOLERANCE = 0.1;

describe('foods.json data integrity', () => {
  it('has at least 100 foods', () => {
    expect(foods.length).toBeGreaterThanOrEqual(100);
  });

  it('every food has required fields', () => {
    for (const food of foods as Food[]) {
      expect(food.id, `${food.name} missing id`).toBeTruthy();
      expect(food.name, `${food.id} missing name`).toBeTruthy();
      expect(food.baseName, `${food.id} missing baseName`).toBeTruthy();
      expect(food.category, `${food.id} missing category`).toBeTruthy();
      expect(food.per100g, `${food.id} missing per100g`).toBeTruthy();
      expect(food.source, `${food.id} missing source`).toBeTruthy();
    }
  });

  it('every food has non-negative nutrient values', () => {
    for (const food of foods as Food[]) {
      const { kcal, protein, carbs, fat } = food.per100g;
      expect(kcal, `${food.name}: negative kcal`).toBeGreaterThanOrEqual(0);
      expect(protein, `${food.name}: negative protein`).toBeGreaterThanOrEqual(0);
      expect(carbs, `${food.name}: negative carbs`).toBeGreaterThanOrEqual(0);
      expect(fat, `${food.name}: negative fat`).toBeGreaterThanOrEqual(0);
    }
  });

  it('kcal ≈ 4*protein + 4*carbs + 9*fat for all foods (±10%)', () => {
    const failing: string[] = [];

    for (const food of foods as Food[]) {
      const { kcal, protein, carbs, fat } = food.per100g;
      const calculated = 4 * protein + 4 * carbs + 9 * fat;

      if (kcal === 0 && calculated === 0) continue;

      const reference = Math.max(kcal, calculated);
      const diff = Math.abs(kcal - calculated) / reference;

      if (diff > TOLERANCE) {
        failing.push(
          `${food.name}: stored=${kcal} calc=${calculated.toFixed(1)} diff=${(diff * 100).toFixed(1)}%`
        );
      }
    }

    if (failing.length > 0) {
      console.warn('Foods with kcal mismatch >10%:\n' + failing.join('\n'));
    }

    expect(failing, 'Foods with significant kcal mismatch').toEqual([]);
  });

  it('all food IDs are unique', () => {
    const ids = (foods as Food[]).map((f) => f.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('source field is USDA or custom', () => {
    for (const food of foods as Food[]) {
      expect(['USDA', 'custom']).toContain(food.source);
    }
  });
});
