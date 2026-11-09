import { describe, it, expect } from 'vitest';
import {
  calcMacrosFromGrams,
  calcMacrosFromManual,
  calcMacrosFromPercentages,
  sumMacros,
  formatMacro,
} from '../lib/macros';
import type { Food } from '../types';

const chickenBreast: Food = {
  id: 'chicken_breast_raw',
  name: 'Pechuga de pollo (cruda)',
  baseName: 'Pechuga de pollo',
  variant: 'cruda',
  category: 'carnes',
  per100g: { kcal: 120, protein: 22.5, carbs: 0, fat: 2.6 },
  source: 'USDA',
};

describe('calcMacrosFromGrams', () => {
  it('calculates macros for 150g chicken breast', () => {
    const result = calcMacrosFromGrams(chickenBreast, 150);
    expect(result.kcal).toBeCloseTo(180, 5);
    expect(result.protein).toBeCloseTo(33.75, 5);
    expect(result.carbs).toBeCloseTo(0, 5);
    expect(result.fat).toBeCloseTo(3.9, 5);
  });

  it('returns zero macros for 0 grams', () => {
    const result = calcMacrosFromGrams(chickenBreast, 0);
    expect(result.kcal).toBe(0);
    expect(result.protein).toBe(0);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(0);
  });

  it('calculates exactly for 100g', () => {
    const result = calcMacrosFromGrams(chickenBreast, 100);
    expect(result.kcal).toBe(120);
    expect(result.protein).toBe(22.5);
  });

  it('preserves full precision (no rounding)', () => {
    const result = calcMacrosFromGrams(chickenBreast, 73);
    expect(result.protein).toBe(22.5 * 0.73);
  });
});

describe('calcMacrosFromManual', () => {
  it('calculates kcal correctly: 4P + 4C + 9F', () => {
    const result = calcMacrosFromManual(30, 50, 10);
    expect(result.kcal).toBe(30 * 4 + 50 * 4 + 10 * 9);
    expect(result.kcal).toBe(410);
    expect(result.protein).toBe(30);
    expect(result.carbs).toBe(50);
    expect(result.fat).toBe(10);
  });

  it('handles zero values', () => {
    const result = calcMacrosFromManual(0, 0, 0);
    expect(result.kcal).toBe(0);
  });

  it('handles fat-only entry', () => {
    const result = calcMacrosFromManual(0, 0, 10);
    expect(result.kcal).toBe(90);
  });
});

describe('calcMacrosFromPercentages', () => {
  it('calculates correctly for 2000 kcal with 30/40/30 split', () => {
    const { macros, error } = calcMacrosFromPercentages(2000, 30, 40, 30);
    expect(error).toBeUndefined();
    expect(macros.kcal).toBe(2000);
    expect(macros.protein).toBeCloseTo((2000 * 0.3) / 4, 5);
    expect(macros.carbs).toBeCloseTo((2000 * 0.4) / 4, 5);
    expect(macros.fat).toBeCloseTo((2000 * 0.3) / 9, 5);
  });

  it('returns error when percentages do not sum to 100', () => {
    const { error } = calcMacrosFromPercentages(2000, 30, 40, 20);
    expect(error).toBeDefined();
    expect(error).toContain('90.0%');
  });

  it('allows floating point tolerance (99.6 is accepted)', () => {
    const { error } = calcMacrosFromPercentages(2000, 33.3, 33.3, 33.3);
    expect(error).toBeUndefined();
  });

  it('rejects sum of 95 (outside ±0.5 tolerance)', () => {
    const { error } = calcMacrosFromPercentages(2000, 30, 35, 30);
    expect(error).toBeDefined();
  });

  it('accepts exact 100', () => {
    const { error } = calcMacrosFromPercentages(2000, 25, 50, 25);
    expect(error).toBeUndefined();
  });
});

describe('sumMacros', () => {
  it('sums multiple macros entries', () => {
    const result = sumMacros([
      { kcal: 200, protein: 20, carbs: 30, fat: 5 },
      { kcal: 300, protein: 25, carbs: 40, fat: 10 },
    ]);
    expect(result.kcal).toBe(500);
    expect(result.protein).toBe(45);
    expect(result.carbs).toBe(70);
    expect(result.fat).toBe(15);
  });

  it('returns zeros for empty array', () => {
    const result = sumMacros([]);
    expect(result.kcal).toBe(0);
    expect(result.protein).toBe(0);
  });
});

describe('formatMacro', () => {
  it('formats to 1 decimal place', () => {
    expect(formatMacro(22.567)).toBe('22.6');
    expect(formatMacro(100)).toBe('100.0');
    expect(formatMacro(0)).toBe('0.0');
  });

  it('rounds correctly at .05 boundary', () => {
    expect(formatMacro(1.05)).toBe('1.1');
    expect(formatMacro(1.04)).toBe('1.0');
  });
});
