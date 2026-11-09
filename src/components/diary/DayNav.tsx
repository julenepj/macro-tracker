import { Button } from '../ui/Button';

interface DayNavProps {
  date: string;
  onChange: (date: string) => void;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.getTime() === today.getTime()) return 'Hoy';
  if (d.getTime() === yesterday.getTime()) return 'Ayer';
  if (d.getTime() === tomorrow.getTime()) return 'Mañana';

  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function DayNav({ date, onChange }: DayNavProps) {
  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      gap: 4,
    }}>
      <Button variant="ghost" size="sm" onClick={() => onChange(addDays(date, -1))} style={{ fontSize: 20, padding: '4px 10px', minHeight: 40 }}>
        ‹
      </Button>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>
          {formatDateLabel(date)}
        </div>
        {!isToday && (
          <button
            onClick={() => onChange(new Date().toISOString().split('T')[0])}
            style={{
              background: 'none',
              color: 'var(--accent)',
              fontSize: 12,
              padding: '1px 0',
            }}
          >
            Ir a hoy
          </button>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={() => onChange(addDays(date, 1))} style={{ fontSize: 20, padding: '4px 10px', minHeight: 40 }}>
        ›
      </Button>
    </div>
  );
}
