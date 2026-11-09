import { useState, useEffect } from 'react';
import { getSetting, setSetting, deleteSetting } from '../../db';
import { USDA_DEMO_KEY } from '../../lib/usdaApi';

export function ApiKeyForm() {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSetting('usdaApiKey').then((v) => {
      if (v) setKey(v);
      setLoaded(true);
    });
  }, []);

  async function handleSave() {
    const trimmed = key.trim();
    if (trimmed) {
      await setSetting('usdaApiKey', trimmed);
    } else {
      await deleteSetting('usdaApiKey');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!loaded) return null;

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Clave API de USDA</h3>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
        La búsqueda online usa USDA FoodData Central. Sin clave, funciona con{' '}
        <code style={{ background: 'var(--card)', padding: '1px 4px', borderRadius: 3 }}>DEMO_KEY</code>
        {' '}(30 búsquedas/hora). Consigue una clave gratuita en{' '}
        <span style={{ color: 'var(--accent)' }}>fdc.nal.usda.gov</span> para sin límite.
      </p>

      <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
        Clave API
      </label>
      <input
        type="text"
        value={key}
        onChange={(e) => { setKey(e.target.value); setSaved(false); }}
        placeholder={`Dejar vacío para usar ${USDA_DEMO_KEY}`}
        style={{ marginBottom: 12 }}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />

      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '11px 0',
          background: saved ? 'var(--accent-muted)' : 'var(--accent)',
          color: saved ? 'var(--accent)' : '#000',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          fontSize: 14,
          transition: 'background 0.2s',
        }}
      >
        {saved ? '✓ Guardado' : 'Guardar'}
      </button>

      <div style={{
        marginTop: 20,
        padding: 12,
        background: 'var(--card)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 12,
        color: 'var(--muted)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text)' }}>Cómo funciona la búsqueda online</strong>
        <ul style={{ paddingLeft: 16, marginTop: 6 }}>
          <li>Si hay pocos resultados locales, la app busca automáticamente en USDA.</li>
          <li>Los alimentos que selecciones se guardan en tu base de datos local para usarlos offline.</li>
          <li>La clave se guarda solo en tu dispositivo (IndexedDB).</li>
        </ul>
      </div>
    </div>
  );
}
