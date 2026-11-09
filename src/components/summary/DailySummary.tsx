import { sumMacros, formatKcal } from '../../lib/macros';
import type { DiaryEntry, Goals } from '../../types';
import { MacroBar } from './MacroBar';

interface DailySummaryProps {
  entries: DiaryEntry[];
  goals: Goals;
}

export function DailySummary({ entries, goals }: DailySummaryProps) {
  const totals = sumMacros(entries.map((e) => e.macros));
  const kcalPct = goals.kcal > 0 ? Math.round((totals.kcal / goals.kcal) * 100) : 0;

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      padding: 16,
      margin: '12px 12px 0',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 42, fontWeight: 700, color: 'var(--kcal)', lineHeight: 1 }}>
          {formatKcal(totals.kcal)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
          kcal · objetivo {goals.kcal} · {kcalPct}%
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <MacroBar
          label="Proteína"
          value={totals.protein}
          goal={goals.protein}
          color="var(--protein)"
        />
        <MacroBar
          label="Carbohidratos"
          value={totals.carbs}
          goal={goals.carbs}
          color="var(--carbs)"
        />
        <MacroBar
          label="Grasa"
          value={totals.fat}
          goal={goals.fat}
          color="var(--fat)"
        />
      </div>
    </div>
  );
}
