# AI Tools Overview

A local-first, interactive AI tools library inspired by the supplied dashboard reference.

**Live:** https://flobra9-works.github.io/ai-tools-overview/

## Run it

From this folder, run:

```powershell
npm run dev
```

Then open `http://localhost:5173`. Set `PORT` to use a different port, e.g. `PORT=5273 npm run dev`.

No install step, account, database, or network connection is required. All data is stored in the browser's local storage.

## Publish with GitHub Pages

The included GitHub Actions workflow deploys this static application to GitHub Pages whenever `main` changes. The repository's Pages source is already set to **GitHub Actions**, so pushing to `main` is enough.

## Included

- 81 curated seed tools across 18 colorful categories
- Add, edit, inspect, favorite, and safely delete tools
- Drag tools between categories or reorder favorites
- Create, edit, collapse, and safely delete categories
- Instant search, pricing/category filters, sorting, and compact-list view
- Persistent personal notes and preferences
- JSON export and validated, confirmation-protected import
