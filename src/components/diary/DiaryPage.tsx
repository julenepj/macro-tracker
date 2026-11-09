import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDiary } from '../../hooks/useDiary';
import { useGoals } from '../../hooks/useGoals';
import { DayNav } from './DayNav';
import { DailySummary } from '../summary/DailySummary';
import { MealGroup } from '../meal/MealGroup';
import { AddEntryModal } from '../meal/AddEntryModal';
import type { MealType } from '../../types';
import { MEAL_ORDER } from '../../types';
import { getCustomFoods, getEntriesByDate, addEntry } from '../../db';
import { Button } from '../ui/Button';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterday(date: string): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function DiaryPage() {
  const [date, setDate] = useState(today());
  const [addOpen, setAddOpen] = useState(false);
  const [defaultMeal, setDefaultMeal] = useState<MealType>('comida');
  const { entries, byMeal } = useDiary(date);
  const { goals } = useGoals();
  const customFoods = useLiveQuery(() => getCustomFoods(), []) ?? [];

  const mealsWithEntries = MEAL_ORDER.filter((m) => byMeal[m].length > 0);

  async function handleCopyYesterday() {
    const prevDate = yesterday(date);
    const prevEntries = await getEntriesByDate(prevDate);
    if (prevEntries.length === 0) return;
    for (const e of prevEntries) {
      await addEntry({ ...e, id: generateId(), date, createdAt: Date.now() });
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
      <DayNav date={date} onChange={setDate} />
      <DailySummary entries={entries} goals={goals} />

      {entries.length === 0 && (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
            Aún no hay entradas para este día
          </p>
          <Button variant="ghost" size="sm" onClick={handleCopyYesterday}>
            Copiar de ayer
          </Button>
        </div>
      )}

      {mealsWithEntries.map((meal) => (
        <MealGroup key={meal} meal={meal} entries={byMeal[meal]} customFoods={customFoods} />
      ))}

      {entries.length > 0 && (
        <div style={{ padding: '4px 12px' }}>
          <Button variant="ghost" size="sm" onClick={handleCopyYesterday} style={{ color: 'var(--muted)', fontSize: 13 }}>
            Copiar de ayer
          </Button>
        </div>
      )}

      <button
        onClick={() => { setDefaultMeal('comida'); setAddOpen(true); }}
        style={{
          position: 'fixed',
          bottom: 76,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#000',
          fontSize: 28,
          fontWeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(34,197,94,0.4)',
          zIndex: 10,
        }}
        aria-label="Añadir alimento"
      >
        +
      </button>

      <AddEntryModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        date={date}
        defaultMeal={defaultMeal}
      />
    </div>
  );
}
