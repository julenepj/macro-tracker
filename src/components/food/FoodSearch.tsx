import { useState, useRef, useEffect, useCallback } from 'react';
import type { Food } from '../../types';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { CATEGORY_LABELS } from '../../types';
import { searchOpenFoodFacts } from '../../lib/openFoodFactsApi';
import { saveCustomFood } from '../../db';

interface FoodSearchProps {
  onSelect: (food: Food) => void;
  autoFocus?: boolean;
}

type OnlineState = 'idle' | 'loading' | 'done' | 'error' | 'rate_limit';

export function FoodSearch({ onSelect, autoFocus }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<Food[]>([]);
  const [onlineState, setOnlineState] = useState<OnlineState>('idle');
  const [savingId, setSavingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const localResults = useFoodSearch(query);

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 100);
  }, [autoFocus]);

  useEffect(() => {
    setOnlineResults([]);
    setOnlineState('idle');
  }, [query]);

  const triggerOnlineSearch = useCallback(async () => {
    if (query.trim().length < 2) return;
    setOnlineState('loading');
    try {
      const results = await searchOpenFoodFacts(query);
      const localIds = new Set(localResults.map((f) => f.id));
      setOnlineResults(results.filter((f) => !localIds.has(f.id)));
      setOnlineState('done');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setOnlineState(msg === 'rate_limit' ? 'rate_limit' : 'error');
    }
  }, [query, localResults]);

  useEffect(() => {
    if (query.trim().length < 2) return;
    if (localResults.length >= 5) return;
    if (onlineState !== 'idle') return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(triggerOnlineSearch, 1200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, localResults.length, onlineState, triggerOnlineSearch]);

  async function handleSelectOnline(food: Food) {
    setSavingId(food.id);
    try {
      await saveCustomFood(food);
    } catch {
      // Ignore duplicate key errors
    }
    setSavingId(null);
    onSelect(food);
  }

  const showOnlineButton =
    query.trim().length >= 2 && onlineState === 'idle' && localResults.length >= 5;

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar alimento… ej. pechuga pollo"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ borderRadius: 'var(--radius-sm)', fontSize: 15 }}
      />

      {localResults.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {localResults.map((food) => (
            <FoodRow key={food.id} food={food} onClick={() => onSelect(food)} />
          ))}
        </div>
      )}

      {query.length > 1 && localResults.length === 0 && onlineState === 'idle' && (
        <p style={{ color: 'var(--muted)', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>
          Sin resultados locales para "{query}"
        </p>
      )}

      {showOnlineButton && (
        <button
          onClick={triggerOnlineSearch}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '9px 12px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--muted)',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span>🌐</span> Buscar más en Open Food Facts
        </button>
      )}

      {onlineState === 'loading' && (
        <p style={{ color: 'var(--muted)', fontSize: 13, padding: '10px 0', textAlign: 'center' }}>
          Buscando en Open Food Facts…
        </p>
      )}

      {onlineState === 'rate_limit' && (
        <p style={{ color: 'var(--warning)', fontSize: 13, padding: '10px 0', textAlign: 'center' }}>
          Demasiadas peticiones. Espera un momento e inténtalo de nuevo.
        </p>
      )}

      {onlineState === 'error' && (
        <p style={{ color: 'var(--danger)', fontSize: 13, padding: '10px 0', textAlign: 'center' }}>
          Error al conectar con Open Food Facts. Comprueba tu conexión.
        </p>
      )}

      {onlineState === 'done' && onlineResults.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '4px 0 2px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span>🌐</span> Open Food Facts
          </div>
          {onlineResults.map((food) => (
            <FoodRow
              key={food.id}
              food={food}
              saving={savingId === food.id}
              onClick={() => handleSelectOnline(food)}
            />
          ))}
        </div>
      )}

      {onlineState === 'done' && onlineResults.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: 13, padding: '8px 0', textAlign: 'center' }}>
          Sin resultados adicionales en Open Food Facts.
        </p>
      )}
    </div>
  );
}

function FoodRow({
  food,
  onClick,
  saving,
}: {
  food: Food;
  onClick: () => void;
  saving?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 4px',
        background: 'none',
        color: saving ? 'var(--muted)' : 'var(--text)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'left',
        gap: 8,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {food.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          {CATEGORY_LABELS[food.category]}
          {food.source === 'custom' && ' · Personalizado'}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right', flexShrink: 0 }}>
        {saving ? (
          <span>Guardando…</span>
        ) : (
          <>
            <div>{food.per100g.kcal} kcal</div>
            <div>P {food.per100g.protein}g</div>
          </>
        )}
      </div>
    </button>
  );
}
