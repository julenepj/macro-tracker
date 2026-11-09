import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FoodSearch } from '../food/FoodSearch';
import type { Food, MealType, DiaryEntry } from '../../types';
import { MEAL_LABELS, MEAL_ORDER } from '../../types';
import { calcMacrosFromGrams, calcMacrosFromManual, calcMacrosFromPercentages } from '../../lib/macros';
import { addEntry, getRecentFoods, getCustomFoods } from '../../db';
import { BASE_FOODS } from '../../hooks/useFoodSearch';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  defaultMeal?: MealType;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AddEntryModal({ isOpen, onClose, date, defaultMeal }: AddEntryModalProps) {
  const [tab, setTab] = useState<'food' | 'manual'>('food');
  const [meal, setMeal] = useState<MealType>(defaultMeal ?? 'comida');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState('');

  const [manualMode, setManualMode] = useState<'grams' | 'pct'>('grams');
  const [manualLabel, setManualLabel] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualKcal, setManualKcal] = useState('');
  const [manualPctP, setManualPctP] = useState('');
  const [manualPctC, setManualPctC] = useState('');
  const [manualPctF, setManualPctF] = useState('');
  const [pctError, setPctError] = useState('');

  const recentFoodIds = useLiveQuery(() => getRecentFoods(8), []);
  const customFoods = useLiveQuery(() => getCustomFoods(), []) ?? [];
  const allFoods = [...BASE_FOODS, ...customFoods];

  const recentFoods = (recentFoodIds ?? [])
    .map((r) => allFoods.find((f) => f.id === r.foodId))
    .filter(Boolean) as Food[];

  function resetState() {
    setSelectedFood(null);
    setGrams('');
    setManualLabel('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setManualKcal('');
    setManualPctP('');
    setManualPctC('');
    setManualPctF('');
    setPctError('');
  }

  function handleClose() {
    resetState();
    onClose();
  }

  async function handleAddFood() {
    if (!selectedFood) return;
    const g = parseFloat(grams);
    if (isNaN(g) || g <= 0) return;

    const entry: DiaryEntry = {
      id: generateId(),
      type: 'food',
      date,
      meal,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      grams: g,
      macros: calcMacrosFromGrams(selectedFood, g),
      createdAt: Date.now(),
    };
    await addEntry(entry);
    handleClose();
  }

  async function handleAddManual() {
    let macros;
    if (manualMode === 'grams') {
      const p = parseFloat(manualProtein) || 0;
      const c = parseFloat(manualCarbs) || 0;
      const f = parseFloat(manualFat) || 0;
      macros = calcMacrosFromManual(p, c, f);
    } else {
      const kcal = parseFloat(manualKcal);
      const pP = parseFloat(manualPctP) || 0;
      const pC = parseFloat(manualPctC) || 0;
      const pF = parseFloat(manualPctF) || 0;
      const result = calcMacrosFromPercentages(kcal, pP, pC, pF);
      if (result.error) {
        setPctError(result.error);
        return;
      }
      macros = result.macros;
    }

    const entry: DiaryEntry = {
      id: generateId(),
      type: 'manual',
      date,
      meal,
      label: manualLabel || undefined,
      macros,
      createdAt: Date.now(),
    };
    await addEntry(entry);
    handleClose();
  }

  const inputStyle = { marginBottom: 10, fontSize: 15 };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Añadir alimento">
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value as MealType)}
            style={{ flex: 1, fontSize: 14 }}
          >
            {MEAL_ORDER.map((m) => (
              <option key={m} value={m}>{MEAL_LABELS[m]}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--card)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
          {(['food', 'manual'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 6,
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--muted)',
                fontWeight: tab === t ? 600 : 400,
                fontSize: 14,
              }}
            >
              {t === 'food' ? 'Alimento' : 'Manual'}
            </button>
          ))}
        </div>

        {tab === 'food' && (
          <div>
            {recentFoods.length > 0 && !selectedFood && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Recientes</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {recentFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 20,
                        background: 'var(--card)',
                        color: 'var(--text)',
                        fontSize: 13,
                        border: '1px solid var(--border)',
                      }}
                    >
                      {food.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!selectedFood ? (
              <FoodSearch onSelect={setSelectedFood} autoFocus />
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  background: 'var(--card)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedFood.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {selectedFood.per100g.kcal} kcal · P{selectedFood.per100g.protein}g · C{selectedFood.per100g.carbs}g · G{selectedFood.per100g.fat}g /100g
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFood(null)}
                    style={{ color: 'var(--muted)', background: 'none', fontSize: 16, padding: '4px 6px' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <input
                    type="number"
                    placeholder="Gramos"
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddFood(); }}
                    style={{ fontSize: 20, fontWeight: 600, textAlign: 'center' }}
                  />
                  <span style={{ color: 'var(--muted)', fontSize: 16, flexShrink: 0 }}>g</span>
                </div>

                {grams && parseFloat(grams) > 0 && (
                  <div style={{
                    background: 'var(--card)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    marginBottom: 12,
                    fontSize: 13,
                    color: 'var(--muted)',
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}>
                    {(() => {
                      const m = calcMacrosFromGrams(selectedFood, parseFloat(grams));
                      return (
                        <>
                          <span style={{ color: 'var(--kcal)' }}>{Math.round(m.kcal)} kcal</span>
                          <span>P {m.protein.toFixed(1)}g</span>
                          <span>C {m.carbs.toFixed(1)}g</span>
                          <span>G {m.fat.toFixed(1)}g</span>
                        </>
                      );
                    })()}
                  </div>
                )}

                <Button variant="primary" style={{ width: '100%' }} onClick={handleAddFood} disabled={!grams || parseFloat(grams) <= 0}>
                  Añadir
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === 'manual' && (
          <div>
            <input
              type="text"
              placeholder="Nombre (opcional)"
              value={manualLabel}
              onChange={(e) => setManualLabel(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: 'flex', gap: 6, marginBottom: 10, background: 'var(--card)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
              {(['grams', 'pct'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setManualMode(m)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 6,
                    background: manualMode === m ? 'var(--surface)' : 'transparent',
                    color: manualMode === m ? 'var(--text)' : 'var(--muted)',
                    fontWeight: manualMode === m ? 600 : 400,
                    fontSize: 13,
                  }}
                >
                  {m === 'grams' ? 'Por gramos' : 'Por porcentaje'}
                </button>
              ))}
            </div>

            {manualMode === 'grams' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--protein)', display: 'block', marginBottom: 4 }}>Proteína (g)</label>
                    <input type="number" value={manualProtein} onChange={(e) => setManualProtein(e.target.value)} placeholder="0" style={{ textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--carbs)', display: 'block', marginBottom: 4 }}>Carbos (g)</label>
                    <input type="number" value={manualCarbs} onChange={(e) => setManualCarbs(e.target.value)} placeholder="0" style={{ textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--fat)', display: 'block', marginBottom: 4 }}>Grasa (g)</label>
                    <input type="number" value={manualFat} onChange={(e) => setManualFat(e.target.value)} placeholder="0" style={{ textAlign: 'center' }} />
                  </div>
                </div>
                {(manualProtein || manualCarbs || manualFat) && (
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
                    = {Math.round(
                      (parseFloat(manualProtein) || 0) * 4 +
                      (parseFloat(manualCarbs) || 0) * 4 +
                      (parseFloat(manualFat) || 0) * 9
                    )} kcal
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={inputStyle}>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Calorías totales</label>
                  <input type="number" value={manualKcal} onChange={(e) => setManualKcal(e.target.value)} placeholder="2000" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 6 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--protein)', display: 'block', marginBottom: 4 }}>P %</label>
                    <input type="number" value={manualPctP} onChange={(e) => { setManualPctP(e.target.value); setPctError(''); }} placeholder="30" style={{ textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--carbs)', display: 'block', marginBottom: 4 }}>C %</label>
                    <input type="number" value={manualPctC} onChange={(e) => { setManualPctC(e.target.value); setPctError(''); }} placeholder="40" style={{ textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--fat)', display: 'block', marginBottom: 4 }}>G %</label>
                    <input type="number" value={manualPctF} onChange={(e) => { setManualPctF(e.target.value); setPctError(''); }} placeholder="30" style={{ textAlign: 'center' }} />
                  </div>
                </div>
                {pctError && (
                  <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{pctError}</div>
                )}
              </>
            )}

            <Button variant="primary" style={{ width: '100%', marginTop: 4 }} onClick={handleAddManual}>
              Añadir
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
