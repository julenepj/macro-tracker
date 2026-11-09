import { useState } from 'react';
import type { DiaryEntry, MealType, Food } from '../../types';
import { MEAL_LABELS } from '../../types';
import { sumMacros, formatMacro, formatKcal } from '../../lib/macros';
import { MealEntry } from './MealEntry';

interface MealGroupProps {
  meal: MealType;
  entries: DiaryEntry[];
  customFoods: Food[];
}

export function MealGroup({ meal, entries, customFoods }: MealGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const totals = sumMacros(entries.map((e) => e.macros));

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      margin: '8px 12px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      <button
        onClick={() => setExpanded((x) => !x)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '12px 12px 12px 14px',
          background: 'none',
          color: 'var(--text)',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, textAlign: 'left' }}>
          {MEAL_LABELS[meal]}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: 'var(--muted)' }}>
          <span style={{ color: 'var(--kcal)' }}>{formatKcal(totals.kcal)} kcal</span>
          <span>P {formatMacro(totals.protein)}g</span>
          <span>C {formatMacro(totals.carbs)}g</span>
          <span>G {formatMacro(totals.fat)}g</span>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 4 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div>
          {entries.map((entry) => (
            <MealEntry key={entry.id} entry={entry} customFoods={customFoods} />
          ))}
        </div>
      )}
    </div>
  );
}
