import { useState, useRef, useEffect } from 'react';
import type { Food } from '../../types';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { CATEGORY_LABELS } from '../../types';

interface FoodSearchProps {
  onSelect: (food: Food) => void;
  autoFocus?: boolean;
}

export function FoodSearch({ onSelect, autoFocus }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const results = useFoodSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

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
      {results.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {results.map((food) => (
            <button
              key={food.id}
              onClick={() => onSelect(food)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 4px',
                background: 'none',
                color: 'var(--text)',
                borderBottom: '1px solid var(--border)',
                textAlign: 'left',
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{food.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {CATEGORY_LABELS[food.category]}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right', flexShrink: 0 }}>
                <div>{food.per100g.kcal} kcal</div>
                <div>P{food.per100g.protein}g</div>
              </div>
            </button>
          ))}
        </div>
      )}
      {query.length > 1 && results.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>
          Sin resultados para "{query}"
        </p>
      )}
    </div>
  );
}
