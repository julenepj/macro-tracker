interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, max, color = 'var(--accent)', height = 6 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = max > 0 && value > max;

  return (
    <div style={{
      background: 'var(--border)',
      borderRadius: height,
      height,
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${pct}%`,
        height: '100%',
        background: over ? 'var(--danger)' : color,
        borderRadius: height,
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}
