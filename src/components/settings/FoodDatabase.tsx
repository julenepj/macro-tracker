import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getCustomFoods, saveCustomFood, deleteCustomFood } from '../../db';
import { FoodForm } from '../food/FoodForm';
import { Button } from '../ui/Button';
import type { Food } from '../../types';
import { CATEGORY_LABELS } from '../../types';

export function FoodDatabase() {
  const customFoods = useLiveQuery(() => getCustomFoods(), []) ?? [];
  const [editing, setEditing] = useState<Food | null | 'new'>(null);

  if (editing !== null) {
    return (
      <FoodForm
        initial={editing === 'new' ? undefined : editing}
        onSave={async (food) => { await saveCustomFood(food); setEditing(null); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Mis alimentos</h3>
        <Button variant="primary" size="sm" onClick={() => setEditing('new')}>+ Nuevo</Button>
      </div>
      {customFoods.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
          Aún no has añadido alimentos propios
        </p>
      ) : (
        <div>
          {customFoods.map((food) => (
            <div key={food.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
              gap: 8,
            }}>
              <div style={{ flex: 1 }} onClick={() => setEditing(food)}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{food.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {CATEGORY_LABELS[food.category]} · {food.per100g.kcal} kcal /100g
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditing(food)} style={{ padding: '4px 8px', minHeight: 32, fontSize: 15 }}>✏️</Button>
              <Button variant="ghost" size="sm" onClick={() => deleteCustomFood(food.id)} style={{ padding: '4px 8px', minHeight: 32, fontSize: 15 }}>🗑</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
