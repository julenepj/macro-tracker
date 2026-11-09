import { sumMacros, formatKcal, formatMacro } from '../../lib/macros';
import type { DiaryEntry, Goals } from '../../types';

interface WeeklyViewProps {
  entries: DiaryEntry[];
  weekDates: string[];
  goals: Goals;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
}

export function WeeklyView({ entries, weekDates, goals }: WeeklyViewProps) {
  const dailyTotals = weekDates.map((date) => {
    const dayEntries = entries.filter((e) => e.date === date);
    return { date, macros: sumMacros(dayEntries.map((e) => e.macros)), hasData: dayEntries.length > 0 };
  });

  const daysWithData = dailyTotals.filter((d) => d.hasData);
  const avg = daysWithData.length > 0
    ? sumMacros(daysWithData.map((d) => ({
        kcal: d.macros.kcal / daysWithData.length,
        protein: d.macros.protein / daysWithData.length,
        carbs: d.macros.carbs / daysWithData.length,
        fat: d.macros.fat / daysWithData.length,
      })))
    : { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  const maxKcal = Math.max(...dailyTotals.map((d) => d.macros.kcal), goals.kcal);

  return (
    <div style={{ padding: '0 12px 24px' }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: 16,
        marginBottom: 12,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Esta semana</h3>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, marginBottom: 8 }}>
          {dailyTotals.map(({ date, macros, hasData }) => {
            const pct = maxKcal > 0 ? (macros.kcal / maxKcal) * 100 : 0;
            const isToday = date === new Date().toISOString().split('T')[0];
            return (
              <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                  {hasData ? formatKcal(macros.kcal) : ''}
                </span>
                <div style={{
                  width: '100%',
                  height: `${pct}%`,
                  minHeight: hasData ? 4 : 0,
                  background: isToday ? 'var(--accent)' : 'var(--card)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s',
                }} />
                <div style={{
                  width: '100%',
                  height: 2,
                  background: goals.kcal ? 'var(--border)' : 'transparent',
                }} />
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {dailyTotals.map(({ date }) => (
            <div key={date} style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 11,
              color: date === new Date().toISOString().split('T')[0] ? 'var(--accent)' : 'var(--muted)',
              fontWeight: date === new Date().toISOString().split('T')[0] ? 600 : 400,
            }}>
              {formatDayLabel(date)}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        padding: 16,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Media diaria</h3>
        {daysWithData.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sin datos esta semana</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Calorías', value: formatKcal(avg.kcal), unit: 'kcal', color: 'var(--kcal)' },
              { label: 'Proteína', value: formatMacro(avg.protein), unit: 'g', color: 'var(--protein)' },
              { label: 'Carbos', value: formatMacro(avg.carbs), unit: 'g', color: 'var(--carbs)' },
              { label: 'Grasa', value: formatMacro(avg.fat), unit: 'g', color: 'var(--fat)' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} style={{
                background: 'var(--card)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
              }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>
                  {value}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)', marginLeft: 2 }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
