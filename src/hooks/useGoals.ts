import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_GOALS, saveGoals } from '../db';

export function useGoals() {
  const goals = useLiveQuery(async () => {
    const g = await db.goals.get('singleton');
    return g ?? DEFAULT_GOALS;
  }, []);

  return {
    goals: goals ?? DEFAULT_GOALS,
    saveGoals,
  };
}
