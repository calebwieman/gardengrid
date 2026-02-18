# GardenGrid 🌱

An intelligent garden planning companion - build beautiful garden layouts with companion planting intelligence.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Drag & Drop:** @dnd-kit

## Getting Started

```bash
cd /home/caleb/.openclaw/workspace-ares/gardengrid
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view.

## Project Structure

```
src/
├── app/           # Next.js app router pages
│   ├── page.tsx   # Main garden grid page
│   └── layout.tsx # Root layout
├── components/    # Reusable UI components (to add)
├── lib/           # Utilities, helpers (to add)
└── stores/        # Zustand stores (to add)
```

## Iteration Progress

- [x] Iteration 1: Project setup + basic grid on screen
- [x] Iteration 2: Add plant data + click to place plants
- [x] Iteration 3: Drag and drop plants onto grid
- [x] Iteration 4: Companion planting logic + compatibility score
- [x] Iteration 5: Resizable grid (4x4, 8x8, 12x12) + garden naming
- [x] Iteration 6: Planting calendar with USDA zone selection + 18 plants
- [x] Iteration 7: Plant search/filter + hover tooltips
- [x] Iteration 8: Auto-save to localStorage + save indicator toast
- [x] Iteration 9: Spacing warnings + garden stats + growing tips
- [x] Iteration 10: Garden templates + 45+ plants database
- [x] Iteration 11: Mobile responsiveness + welcome modal + UI polish
- [x] Iteration 12: Plant lifecycle tracking (seedling → growing → ready) + harvest date predictions + 60+ plants
- [x] Iteration 13: Garden journal - add notes, observations, harvests, problems
- [x] Iteration 14: Export garden as image (PNG download)
- [x] Iteration 15: Weather widget + frost date alerts + planting advice
- [x] Iteration 16: Garden Care - soil type selection, watering schedule, pest reference
- [x] Iteration 17: Seed Shopping List - generates shopping list based on placed plants
- [x] Iteration 18: Monthly Garden Task Checklist - zone-based personalized monthly tasks
- [x] Iteration 19: Garden Analytics Dashboard - harvest timeline, category breakdown, growth progress, sun needs
- [x] Iteration 20: Succession Planting Scheduler - continuous harvest planning with zone-based planting dates
- [x] Iteration 21: Garden Themes - pre-designed garden layouts (Pizza, Salsa, Salad, Herb Spiral, Three Sisters, Butterfly, Soup, Pickling, Asian, Square Foot)
- [x] Iteration 22: Yield Tracker - set expected yields per plant, log harvests, track expected vs actual yields with progress bars and summary dashboard
- [x] Iteration 23: Recipe Suggestions - generates recipe ideas based on what's planted in the garden, with ingredients, cooking time, difficulty, and match percentage
- [x] Iteration 24: Garden Photo Gallery - upload photos to document garden progress over time with captions and dates
- [x] Iteration 25: Garden Achievements - gamification system with 20+ achievements for planting, harvesting, companion planting, consistency, and exploration
- [x] Iteration 26: Moon Phase Gardening - lunar phase tracker with planting advice based on moon calendar
- [x] Iteration 27: Garden Supply Calculator - estimates seeds, soil, fertilizer, mulch, and supplies costs based on garden layout
- [x] Iteration 28: Garden Cost Tracker - track garden expenses over time with categories, monthly breakdown, and spending analysis
- [x] Iteration 29: Garden Health Score - comprehensive dashboard showing companion planting, diversity, spacing, and seasonal scores with actionable suggestions
- [x] Iteration 30: Garden Backup & Import/Export - export single or all gardens to JSON, import gardens from files, automatic backup timestamp tracking
- [x] Iteration 31: Integrated Pest Tracker + Crop Rotation Planner - two existing components now accessible via navigation tabs

## Features (Coming Soon)

- Visual garden layout builder with drag-and-drop
- 500+ plant database with companion planting info
- Garden-wide compatibility scoring
- Planting calendar based on frost dates
- Garden journal
