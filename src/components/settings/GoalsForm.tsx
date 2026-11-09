import { useState, useEffect } from 'react';
import type { Goals } from '../../types';
import { Button } from '../ui/Button';

interface GoalsFormProps {
  goals: Goals;
  onSave: (goals: Omit<Goals, 'id'>) => Promise<void>;
}

export function GoalsForm({ goals, onSave }: GoalsFormProps) {
  const [kcal, setKcal] = useState(String(goals.kcal));
  const [protein, setProtein] = useState(String(goals.protein));
  const [carbs, setCarbs] = useState(String(goals.carbs));
  const [fat, setFat] = useState(String(goals.fat));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKcal(String(goals.kcal));
    setProtein(String(goals.protein));
    setCarbs(String(goals.carbs));
    setFat(String(goals.fat));
  }, [goals]);

  async function handleSave() {
    await onSave({
      kcal: parseFloat(kcal) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Objetivos diarios</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Calorías', value: kcal, setter: setKcal, unit: 'kcal', color: 'var(--kcal)' },
          { label: 'Proteína', value: protein, setter: setProtein, unit: 'g', color: 'var(--protein)' },
          { label: 'Carbohidratos', value: carbs, setter: setCarbs, unit: 'g', color: 'var(--carbs)' },
          { label: 'Grasa', value: fat, setter: setFat, unit: 'g', color: 'var(--fat)' },
        ].map(({ label, value, setter, unit, color }) => (
          <div key={label}>
            <label style={{ fontSize: 12, color, display: 'block', marginBottom: 4 }}>
              {label} ({unit})
            </label>
            <input type="number" value={value} onChange={(e) => setter(e.target.value)} />
          </div>
        ))}
      </div>
      <Button variant="primary" onClick={handleSave} style={{ width: '100%' }}>
        {saved ? '✓ Guardado' : 'Guardar objetivos'}
      </Button>
    </div>
  );
}
