# Pantry

Pantry is a calm, visual recipe finder for discovering meals without endless scrolling. It uses a small, responsive React interface to search TheMealDB, refine results by category and cuisine, open full recipe instructions, and save favorite recipes locally in the browser.

## Features

The app provides free-text recipe search with shareable URL query state, popular-search shortcuts, loading/error/empty states, category and cuisine filters, alphabetical sorting, and responsive result cards. Each result can open a detail dialog with the recipe image, metadata, tags, ingredients, measurements, instructions, video link, and source link. Favorite recipes can be saved from cards or the detail dialog and remain available in the Saved recipes section after a reload through browser local storage. Saved recipes can also be scheduled into a Monday–Sunday meal planner with breakfast, lunch, and dinner slots; the planner supports week navigation, rescheduling by replacing a slot, removal, drag-and-drop moves between slots, and persistence in browser local storage. The planner automatically aggregates ingredients from scheduled recipes into a checkable shopping list and provides estimated daily calories, protein, carbohydrates, and fat summaries. A pantry inventory control lets users mark ingredients already on hand; those items are subtracted from the shopping list while remaining editable in the inventory panel. When pantry items are available, Pantry also recommends recipes that use them, ranking results by matched ingredients and showing how many additional ingredients remain to shop. The grocery section also includes a budget estimator that totals only missing ingredients after pantry subtraction; each item price can be edited and is persisted locally. With browser location permission, Pantry can discover nearby stores and compare matching community-reported price observations from Open Prices, while keeping the editable estimate as a fallback when public coverage is unavailable.

The interface is designed mobile-first with semantic headings, labels, visible focus styles, keyboard-friendly controls, Escape-to-close detail dialogs, reduced-motion support, and resilient image and API failure states.

## Local development

The project requires Node.js and pnpm. Install dependencies, start the development server, and open the printed local URL:

```bash
pnpm install
pnpm dev
```

The meal planner, checked grocery items, pantry inventory, and schedule are stored locally in the browser and do not require an account or server database. The project does not require an application-specific secret for local development. Recipe data is provided by TheMealDB’s free developer test API. Public production distribution should follow TheMealDB’s supporter and attribution requirements; see the official API guide in the references below.

## Quality scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server. |
| `pnpm check` | Run the TypeScript compiler without emitting files. |
| `pnpm test` | Run the Vitest test suite once. |
| `pnpm test:watch` | Run Vitest in watch mode. |
| `pnpm build` | Type-check and create a production Vite build. |
| `pnpm preview` | Preview the production build locally. |

## API integration

The app uses TheMealDB V1 JSON endpoints for meal-name search, category and area filters, category/area option lists, and full meal lookup by ID. The normalized internal model keeps API-specific field names out of the UI and safely ignores empty ingredient slots. TheMealDB documents the API as free for development and educational use with test key `1`; public app-store distribution may require a supporter key and attribution.[1]

The API is accessed directly from the browser, so the app depends on the data source being reachable and may be affected by service availability or rate limits. TheMealDB does not provide nutrition fields in the recipe payload used here, so the nutrition panel is explicitly labeled as an estimate based on ingredient-name matching; it is not a dietary, medical, or label-accurate calculation. Budget estimates use editable default item-level prices and do not account for store, brand, package size, tax, or currency differences. Nearby-store discovery uses public Open Prices location data with an OpenStreetMap Overpass fallback. Public price observations are not guaranteed retailer feeds and may be incomplete, stale, or unavailable for a specific area or ingredient; the comparison panel displays coverage and reported currency rather than implying live inventory. Filters are limited to fields reliably returned by the API. When a text query and category/cuisine filter are combined, the text search is retrieved first and the category/cuisine match is applied locally because the free V1 endpoints expose those operations separately.

## Repository and commit history

The implementation was developed in focused feature slices. The location-aware comparison uses browser geolocation only after explicit user action and does not persist coordinates. The main branch contains separate commits for the foundation, search, filtering/sorting, recipe details, persistent favorites, and accessibility polish. Generated dependencies and build output are excluded through `.gitignore`.

## Security notes

Never place GitHub credentials, API keys, or other secrets in source files, URLs, commit messages, or the README. The credential used to access the repository was handled temporarily outside Git metadata and should be revoked or rotated by the owner after use.

## References

[1]: https://www.themealdb.com/docs_api_guide.php "TheMealDB API Guide"
