import { useRef } from 'react';
import { Button } from '../ui/Button';
import { db, saveCustomFood } from '../../db';
import type { DiaryEntry, Food } from '../../types';

export function ImportExport() {
  const fileRef = useRef<HTMLInputElement>(null);

  async function exportJSON() {
    const entries = await db.entries.toArray();
    const customFoods = await db.foods.toArray();
    const goals = await db.goals.toArray();
    const data = { version: 1, exportedAt: new Date().toISOString(), entries, customFoods, goals };
    download(JSON.stringify(data, null, 2), `macros-${today()}.json`, 'application/json');
  }

  async function exportCSV() {
    const entries = await db.entries.toArray();
    const rows = [
      ['fecha', 'comida', 'nombre', 'gramos', 'kcal', 'proteina_g', 'carbos_g', 'grasa_g'],
    ];
    for (const e of entries) {
      rows.push([
        e.date,
        e.meal,
        e.type === 'food' ? e.foodName : (e.label ?? 'Manual'),
        e.type === 'food' ? String(e.grams) : '',
        e.macros.kcal.toFixed(1),
        e.macros.protein.toFixed(1),
        e.macros.carbs.toFixed(1),
        e.macros.fat.toFixed(1),
      ]);
    }
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    download(csv, `macros-${today()}.csv`, 'text/csv;charset=utf-8');
  }

  async function importJSON(file: File) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.version || !Array.isArray(data.entries)) {
      alert('Archivo no válido');
      return;
    }
    const confirmed = window.confirm(
      `Importar ${data.entries.length} entradas y ${(data.customFoods ?? []).length} alimentos personalizados. ` +
      'Los datos existentes se conservarán (se añaden, no se reemplazan). ¿Continuar?'
    );
    if (!confirmed) return;

    for (const e of data.entries as DiaryEntry[]) {
      try { await db.entries.add(e); } catch { /* duplicate id, skip */ }
    }
    for (const f of (data.customFoods ?? []) as Food[]) {
      await saveCustomFood(f);
    }
    alert('Importación completada');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) importJSON(file);
    e.target.value = '';
  }

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Exportar / Importar</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="secondary" onClick={exportJSON} style={{ justifyContent: 'flex-start' }}>
          ↓ Exportar JSON (todos los datos)
        </Button>
        <Button variant="secondary" onClick={exportCSV} style={{ justifyContent: 'flex-start' }}>
          ↓ Exportar CSV (entradas)
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} style={{ justifyContent: 'flex-start' }}>
          ↑ Importar JSON
        </Button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
          La importación añade datos sin borrar los existentes.
        </p>
      </div>
    </div>
  );
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function download(content: string, filename: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
}
