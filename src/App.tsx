import { useState } from 'react';
import { DiaryPage } from './components/diary/DiaryPage';
import { SummaryPage } from './components/summary/SummaryPage';
import { SettingsPage } from './components/settings/SettingsPage';

type Tab = 'diary' | 'summary' | 'settings';

const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: 'diary', icon: '📋', label: 'Diario' },
  { id: 'summary', icon: '📊', label: 'Resumen' },
  { id: 'settings', icon: '⚙️', label: 'Ajustes' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('diary');

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'diary' && <DiaryPage />}
        {tab === 'summary' && <SummaryPage />}
        {tab === 'settings' && <SettingsPage />}
      </div>

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {NAV_ITEMS.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '10px 0',
              background: 'none',
              color: tab === id ? 'var(--accent)' : 'var(--muted)',
              fontSize: 11,
              fontWeight: tab === id ? 600 : 400,
              minHeight: 56,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
