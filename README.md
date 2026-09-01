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
- Drag categories by their header to reorder the board, or use **Move earlier / Move later**
  in the category menu (this also works on touch, where HTML5 drag-and-drop does not)
- Create, edit, collapse, and safely delete categories from the top bar or the board
- Instant search, pricing/category filters, sorting (including by quality), and compact-list view
- Persistent personal notes and preferences
- JSON export and validated, confirmation-protected import

## Adding a tool

Type a name that matches something in the built-in tool library (all 81 seed
tools, by name) and the rest of the form — category, description, website,
pricing, rating, tags — fills in automatically; you can still edit anything
it suggests. Pasting a website URL still works as a lighter-weight fallback
for domains outside the library. A name with no match in the library (i.e.
any genuinely new tool) needs its details filled in by hand — this is a
local-first app with no backend, so it can't look anything up live.

A few tools also carry a **quality** score and **cost per task**, sourced
from [Artificial Analysis](https://artificialanalysis.ai):

- ChatGPT, Claude, Gemini, Grok, and Microsoft Copilot are scored on the
  general **Intelligence Index**, mapped to the flagship reasoning tier of
  the model powering each product.
- Cursor is scored on the separate **Coding Agent Index** (it's benchmarked
  directly as a coding agent, not approximated via an underlying model) —
  shown with its own label since the two indexes aren't on the same scale.
- GitHub Copilot isn't benchmarked as an agent there, so its number is an
  approximation via its default underlying chat model, same as Microsoft
  Copilot; the detail view says so explicitly.
