# Macro Tracker

PWA para seguimiento diario de macronutrientes. Sin backend, sin login, todo local.

## Arranque

```bash
npm install
npm run dev        # desarrollo en http://localhost:5173
npm run build      # build de producción
npm run preview    # previsualizar build
npm test           # tests unitarios
```

## Funcionalidades

- **Diario**: añadir comidas por alimento o manualmente, navegar entre días, copiar de ayer
- **Resumen**: totales del día con barras de progreso, vista semanal con gráfico y medias
- **Ajustes**: objetivos diarios, gestión de alimentos propios, exportar/importar JSON y CSV

## Añadir alimentos al JSON

El archivo `src/data/foods.json` contiene ~170 alimentos de USDA FoodData Central (SR Legacy).

Para añadir uno:

```json
{
  "id": "id_unico_sin_espacios",
  "name": "Nombre completo (variante)",
  "baseName": "Nombre base",
  "variant": "cruda",        // opcional: "cruda" | "cocinada"
  "category": "carnes",      // ver categorías abajo
  "per100g": {
    "kcal": 165,             // debe ser ≈ 4*protein + 4*carbs + 9*fat
    "protein": 31.0,         // gramos por 100 g
    "carbs": 0.0,
    "fat": 3.6,
    "fiber": 0.0             // opcional
  },
  "source": "USDA",
  "fdcId": 171478            // ID en USDA FoodData Central (referencia)
}
```

**Categorías**: `carnes`, `pescados`, `huevos`, `lacteos`, `legumbres`, `cereales`, `verduras`, `frutas`, `frutos_secos`, `aceites`, `otros`

**Regla de kcal**: para mantener coherencia interna, `kcal ≈ 4·proteína + 4·carbos + 9·grasa`. El test `src/__tests__/foods.test.ts` verifica esto con tolerancia del 10%.

## Fuente de datos

Todos los valores nutricionales provienen de **USDA FoodData Central SR Legacy** (https://fdc.nal.usda.gov). Los kcal almacenados están ajustados al método Atwater (4/4/9) para garantizar coherencia interna con los cálculos de la app.

## Tecnologías

- React 18 + Vite + TypeScript
- Dexie (IndexedDB) — almacenamiento local
- Fuse.js — búsqueda fuzzy tolerante a tildes
- Zustand — estado global
- vite-plugin-pwa — service worker + offline
- Vitest — tests unitarios
