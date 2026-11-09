import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';
import { useLiveQuery } from 'dexie-react-hooks';
import baseFoods from '../data/foods.json';
import { getCustomFoods } from '../db';
import type { Food } from '../types';

const BASE_FOODS = baseFoods as Food[];

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

const fuseOptions: IFuseOptions<Food> = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'baseName', weight: 0.3 },
  ],
  threshold: 0.4,
  includeScore: true,
};

export function useFoodSearch(query: string): Food[] {
  const customFoods = useLiveQuery(() => getCustomFoods(), []) ?? [];

  const allFoods = useMemo(
    () => [...BASE_FOODS, ...customFoods],
    [customFoods]
  );

  const fuse = useMemo(() => new Fuse(allFoods, fuseOptions), [allFoods]);

  return useMemo(() => {
    if (!query.trim()) return [];
    const normalizedQuery = normalizeText(query);
    const results = fuse.search(normalizedQuery, { limit: 20 });
    return results.map((r) => r.item);
  }, [query, fuse]);
}

export function getFoodById(id: string, customFoods: Food[] = []): Food | undefined {
  return [...BASE_FOODS, ...customFoods].find((f) => f.id === id);
}

export { BASE_FOODS };
