import { ProgressBar } from '../ui/ProgressBar';
import { formatMacro, formatKcal } from '../../lib/macros';

interface MacroBarProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit?: string;
  isKcal?: boolean;
}

export function MacroBar({ label, value, goal, color, unit = 'g', isKcal = false }: MacroBarProps) {
  const formatted = isKcal ? formatKcal(value) : formatMacro(value);
  const pct = goal > 0 ? Math.round((value / goal) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color }}>
            {formatted}{unit}
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            / {isKcal ? goal : goal}{unit} · {pct}%
          </span>
        </div>
      </div>
      <ProgressBar value={value} max={goal} color={color} />
    </div>
  );
}
