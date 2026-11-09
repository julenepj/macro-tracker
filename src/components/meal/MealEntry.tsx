import { useState } from 'react';
import type { DiaryEntry } from '../../types';
import { formatMacro, formatKcal } from '../../lib/macros';
import { deleteEntry, updateEntry } from '../../db';
import { calcMacrosFromGrams } from '../../lib/macros';
import { BASE_FOODS } from '../../hooks/useFoodSearch';

interface MealEntryProps {
  entry: DiaryEntry;
  customFoods: import('../../types').Food[];
}

export function MealEntry({ entry, customFoods }: MealEntryProps) {
  const [editing, setEditing] = useState(false);
  const [grams, setGrams] = useState(entry.type === 'food' ? String(entry.grams) : '');

  const name = entry.type === 'food' ? entry.foodName : (entry.label || 'Entrada manual');

  async function handleDelete() {
    await deleteEntry(entry.id);
  }

  async function handleEditSave() {
    if (entry.type !== 'food') { setEditing(false); return; }
    const g = parseFloat(grams);
    if (isNaN(g) || g <= 0) return;
    const food = [...BASE_FOODS, ...customFoods].find((f) => f.id === entry.foodId);
    if (!food) return;
    await updateEntry({ ...entry, grams: g, macros: calcMacrosFromGrams(food, g) });
    setEditing(false);
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      borderBottom: '1px solid var(--border)',
      gap: 8,
    }}>
      {editing && entry.type === 'food' ? (
        <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14, flex: 1 }}>{name}</span>
          <input
            type="number"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            style={{ width: 70, padding: '6px 8px', fontSize: 14 }}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditing(false); }}
          />
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>g</span>
          <button onClick={handleEditSave} style={{ color: 'var(--accent)', background: 'none', fontSize: 18, padding: '4px 6px', minHeight: 32 }}>✓</button>
          <button onClick={() => setEditing(false)} style={{ color: 'var(--muted)', background: 'none', fontSize: 16, padding: '4px 6px', minHeight: 32 }}>✕</button>
        </div>
      ) : (
        <div style={{ flex: 1 }} onClick={() => setEditing(true)}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>
            {entry.type === 'food' && `${entry.grams}g · `}
            <span style={{ color: 'var(--kcal)' }}>{formatKcal(entry.macros.kcal)} kcal</span>
            {' · '}
            <span style={{ color: 'var(--protein)' }}>P {formatMacro(entry.macros.protein)}g</span>
            {' · '}
            <span style={{ color: 'var(--carbs)' }}>C {formatMacro(entry.macros.carbs)}g</span>
            {' · '}
            <span style={{ color: 'var(--fat)' }}>G {formatMacro(entry.macros.fat)}g</span>
          </div>
        </div>
      )}
      {!editing && (
        <button
          onClick={handleDelete}
          style={{
            background: 'none',
            color: 'var(--muted)',
            fontSize: 16,
            padding: '4px 6px',
            minHeight: 32,
            borderRadius: 4,
          }}
          aria-label="Borrar"
        >
          🗑
        </button>
      )}
    </div>
  );
}
