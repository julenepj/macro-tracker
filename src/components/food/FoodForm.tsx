import { useState } from 'react';
import type { Food, FoodCategory } from '../../types';
import { CATEGORY_LABELS } from '../../types';
import { Button } from '../ui/Button';

interface FoodFormProps {
  initial?: Food;
  onSave: (food: Food) => Promise<void>;
  onCancel: () => void;
}

function newId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function FoodForm({ initial, onSave, onCancel }: FoodFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [baseName, setBaseName] = useState(initial?.baseName ?? '');
  const [category, setCategory] = useState<FoodCategory>(initial?.category ?? 'otros');
  const [kcal, setKcal] = useState(String(initial?.per100g.kcal ?? ''));
  const [protein, setProtein] = useState(String(initial?.per100g.protein ?? ''));
  const [carbs, setCarbs] = useState(String(initial?.per100g.carbs ?? ''));
  const [fat, setFat] = useState(String(initial?.per100g.fat ?? ''));

  const calcKcal = (parseFloat(protein) || 0) * 4 + (parseFloat(carbs) || 0) * 4 + (parseFloat(fat) || 0) * 9;

  async function handleSave() {
    if (!name.trim()) return;
    const food: Food = {
      id: initial?.id ?? newId(),
      name: name.trim(),
      baseName: (baseName || name).trim(),
      category,
      per100g: {
        kcal: parseFloat(kcal) || Math.round(calcKcal),
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      },
      source: 'custom',
    };
    await onSave(food);
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Nombre</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Arroz integral (cocido)" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Nombre base (para agrupar variantes)</label>
        <input type="text" value={baseName} onChange={(e) => setBaseName(e.target.value)} placeholder="Ej: Arroz integral" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Categoría</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as FoodCategory)}>
          {(Object.keys(CATEGORY_LABELS) as FoodCategory[]).map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 6 }}>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Valores por 100 g</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Proteína (g)', value: protein, setter: setProtein, color: 'var(--protein)' },
            { label: 'Carbos (g)', value: carbs, setter: setCarbs, color: 'var(--carbs)' },
            { label: 'Grasa (g)', value: fat, setter: setFat, color: 'var(--fat)' },
            { label: 'Kcal', value: kcal, setter: setKcal, color: 'var(--kcal)', placeholder: `≈${Math.round(calcKcal)}` },
          ].map(({ label, value, setter, color, placeholder }) => (
            <div key={label}>
              <label style={{ fontSize: 11, color, display: 'block', marginBottom: 3 }}>{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder ?? '0'}
                style={{ textAlign: 'center', fontSize: 14 }}
              />
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
        Kcal calculadas (4P+4C+9G): {Math.round(calcKcal)}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="secondary" onClick={onCancel} style={{ flex: 1 }}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={!name.trim()} style={{ flex: 1 }}>Guardar</Button>
      </div>
    </div>
  );
}
