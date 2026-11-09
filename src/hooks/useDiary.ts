import { useLiveQuery } from 'dexie-react-hooks';
import { db, getEntriesByDate } from '../db';
import type { DiaryEntry, MealType } from '../types';
import { MEAL_ORDER } from '../types';

export type EntriesByMeal = Record<MealType, DiaryEntry[]>;

export function useDiary(date: string) {
  const entries = useLiveQuery(() => getEntriesByDate(date), [date]) ?? [];

  const byMeal = MEAL_ORDER.reduce((acc, meal) => {
    acc[meal] = entries.filter((e) => e.meal === meal);
    return acc;
  }, {} as EntriesByMeal);

  return { entries, byMeal };
}

export function useWeekEntries(weekDates: string[]) {
  const start = weekDates[0];
  const end = weekDates[weekDates.length - 1];
  const entries = useLiveQuery(
    () => db.entries.where('date').between(start, end, true, true).toArray(),
    [start, end]
  ) ?? [];
  return entries;
}
