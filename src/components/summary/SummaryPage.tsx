import { useMemo } from 'react';
import { useWeekEntries } from '../../hooks/useDiary';
import { useGoals } from '../../hooks/useGoals';
import { WeeklyView } from './WeeklyView';

function getWeekDates(): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function SummaryPage() {
  const weekDates = useMemo(() => getWeekDates(), []);
  const entries = useWeekEntries(weekDates);
  const { goals } = useGoals();

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
      <div style={{ padding: '12px 12px 0' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Resumen</h2>
      </div>
      <WeeklyView entries={entries} weekDates={weekDates} goals={goals} />
    </div>
  );
}
