# AI Tools Overview

A local-first, interactive AI tools library inspired by the supplied dashboard reference.

**Live:** https://flobra9-works.github.io/ai-tools-overview/

## Run it

From this folder, run:

```powershell
npm run dev
```

Then open `http://localhost:5173`. Set `PORT` to use a different port, e.g. `PORT=5273 npm run dev`.

No install step, account, or database is required, and the app itself works offline. All data is stored in the
browser's local storage. Two things go online. Cloud sync (only when linked with a key) talks to your own n8n webhook. And the **Add/Edit tool** form: when you enter a website
(or a name it can't match locally) it asks [microlink.io](https://microlink.io) — falling back to
[r.jina.ai](https://jina.ai/reader) — for that page's own description, and DuckDuckGo's instant-answer API to
resolve a bare name to its official site. Nothing else is sent anywhere.

## Publish with GitHub Pages

The included GitHub Actions workflow deploys this static application to GitHub Pages whenever `main` changes. The repository's Pages source is already set to **GitHub Actions**, so pushing to `main` is enough.

## Included

- 93 seed tools across 17 categories (the board as curated on 2 Sep 2026); most carry the
  description from their own homepage (og/meta description), the rest a short curated line
- Add, edit, inspect, favorite, and safely delete tools
- Drag tools between categories or reorder favorites
- Drag categories by their header to reorder the board, or use **Move earlier / Move later**
  in the category menu (this also works on touch, where HTML5 drag-and-drop does not)
- Create, edit, collapse, and safely delete categories from the top bar or the board
- Categories show their first 5 tools with a **Show N more** button (remembered per category);
  searching always shows every match
- Instant search, pricing/category filters, sorting (including by quality), and compact-list view
- Everything you change — tool and category order, favorites, collapsed/expanded state, filters,
  sort, view mode, notes — is saved to the browser's local storage as you go and restored on the
  next visit. Storage is per browser and per site address, so a different browser, device, or
  private window starts fresh; use Export/Import to carry a library across.
- JSON export and validated, confirmation-protected import
- **Cloud sync across devices** via an n8n webhook: the plain address works everywhere. Every
  change is pushed to a single row in the `ai_tools_library` data table; every browser pulls the
  latest copy on open and whenever the tab comes back into view. Last write wins by save time.
  The sync key ships inside `app.js` — this repo is public, so treat the library as public and
  overwritable; before each overwrite the previous version (if older than 10 minutes) is archived
  to `ai_tools_library_history` and kept 30 days, so a bad write can be rolled back from n8n.
  A different key can be supplied per browser via `…/#sync=KEY`.
- Automatic local backups: the last four full copies are kept in the browser (one daily, one before
  any import or restore, one whenever a save would halve the library). If the main storage key is
  ever empty, the newest backup is restored on load. **Backups** in the top bar lists and restores
  them; they live in the same browser, so Export is still the way to keep a copy elsewhere.

## Adding a tool

Type a name that matches something in the built-in tool library (all 93 seed
tools, by name) and the rest of the form — category, description, website,
pricing, rating, tags — fills in automatically; you can still edit anything
it suggests. For a tool that isn't in the library, the form goes online:
enter the website and its description is pulled from the page's own
meta/og description (the "subtitle" of the homepage); enter just a name
and it tries DuckDuckGo to find the official site and a one-line summary,
then fetches the site's description. The **↻ From website** button next to
Description re-fetches on demand, for any tool, including the curated ones.

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

For these tools the **star rating is derived from the AA score** rather than
hand-picked: each score is scaled against the current top of its own
leaderboard (Intelligence Index 63, Coding Agent Index 68), then >=95% -> 5 stars,
>=85% -> 4, >=70% -> 3, >=55% -> 2, below -> 1. Derived stars show in green,
and the rating dropdown is locked for them. Every other tool keeps a
personal 1-5 rating you set yourself.
