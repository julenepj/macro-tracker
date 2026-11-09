import Dexie, { type Table } from 'dexie';
import type { Food, DiaryEntry, Goals, RecentFood } from '../types';

type CustomFood = Food & { _custom: 1 };

class MacroTrackerDB extends Dexie {
  foods!: Table<CustomFood, string>;
  entries!: Table<DiaryEntry, string>;
  goals!: Table<Goals & { id: string }, string>;
  recentFoods!: Table<RecentFood, string>;

  constructor() {
    super('MacroTrackerDB');
    this.version(1).stores({
      foods: 'id, category',
      entries: 'id, date, [date+meal]',
      goals: 'id',
      recentFoods: 'foodId, lastUsed, useCount',
    });
  }
}

export const db = new MacroTrackerDB();

export const DEFAULT_GOALS: Goals = {
  id: 'singleton',
  kcal: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
};

export async function getGoals(): Promise<Goals> {
  const g = await db.goals.get('singleton');
  return g ?? DEFAULT_GOALS;
}

export async function saveGoals(goals: Omit<Goals, 'id'>): Promise<void> {
  await db.goals.put({ ...goals, id: 'singleton' });
}

export async function addEntry(entry: DiaryEntry): Promise<void> {
  await db.entries.add(entry);
  if (entry.type === 'food') {
    await updateRecentFood(entry.foodId);
  }
}

export async function updateEntry(entry: DiaryEntry): Promise<void> {
  await db.entries.put(entry);
}

export async function deleteEntry(id: string): Promise<void> {
  await db.entries.delete(id);
}

export async function getEntriesByDate(date: string): Promise<DiaryEntry[]> {
  return db.entries.where('date').equals(date).toArray();
}

export async function getEntriesRange(startDate: string, endDate: string): Promise<DiaryEntry[]> {
  return db.entries.where('date').between(startDate, endDate, true, true).toArray();
}

export async function updateRecentFood(foodId: string): Promise<void> {
  const existing = await db.recentFoods.get(foodId);
  if (existing) {
    await db.recentFoods.put({
      foodId,
      lastUsed: Date.now(),
      useCount: existing.useCount + 1,
    });
  } else {
    await db.recentFoods.put({ foodId, lastUsed: Date.now(), useCount: 1 });
  }
}

export async function getRecentFoods(limit = 10): Promise<RecentFood[]> {
  const all = await db.recentFoods.orderBy('lastUsed').reverse().limit(limit * 2).toArray();
  all.sort((a, b) => b.useCount * 1000 + b.lastUsed - (a.useCount * 1000 + a.lastUsed));
  return all.slice(0, limit);
}

export async function getCustomFoods(): Promise<Food[]> {
  return db.foods.toArray();
}

export async function saveCustomFood(food: Food): Promise<void> {
  await db.foods.put({ ...food, _custom: 1 } as CustomFood);
}

export async function deleteCustomFood(id: string): Promise<void> {
  await db.foods.delete(id);
}
