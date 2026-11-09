import { useState } from 'react';
import { GoalsForm } from './GoalsForm';
import { FoodDatabase } from './FoodDatabase';
import { ImportExport } from './ImportExport';
import { useGoals } from '../../hooks/useGoals';

type Section = 'goals' | 'foods' | 'export';

export function SettingsPage() {
  const [section, setSection] = useState<Section>('goals');
  const { goals, saveGoals } = useGoals();

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>
      <div style={{ padding: '12px 12px 0' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Ajustes</h2>
        <div style={{ display: 'flex', gap: 6, background: 'var(--card)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
          {([
            { id: 'goals', label: 'Objetivos' },
            { id: 'foods', label: 'Alimentos' },
            { id: 'export', label: 'Exportar' },
          ] as { id: Section; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 6,
                background: section === id ? 'var(--surface)' : 'transparent',
                color: section === id ? 'var(--text)' : 'var(--muted)',
                fontWeight: section === id ? 600 : 400,
                fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', margin: 12, borderRadius: 'var(--radius)' }}>
        {section === 'goals' && <GoalsForm goals={goals} onSave={saveGoals} />}
        {section === 'foods' && <FoodDatabase />}
        {section === 'export' && <ImportExport />}
      </div>
    </div>
  );
}
