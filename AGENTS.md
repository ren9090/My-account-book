# AGENTS.md

Personal expense-tracking PWA (记账本), deployed to Vercel. Zero dependencies: no package.json, no build step, no linter, no tests, no CI. The app is one HTML file.

## Run / verify

- Serve statically, then test in a browser: `npx serve .` or `python -m http.server 8080`
- There is no automated verification. Test manually: add income/expense, filter, stats, reload (SW caching can mask changes — see below).
- Live URL: `https://my-account-book-opal.vercel.app` (auto-deploys from GitHub `main`).

## Architecture

- **`index.html` = the entire app.** All CSS and JS live in one inline `<script>`. All functions are global and wired via `onclick="fn()"` attributes — renaming a function means updating the HTML attributes too.
- **`sw.js`**: cache-first service worker. `CACHE_NAME` is versioned (`account-book-v1`). **Bump `CACHE_NAME` whenever you change `index.html`, `manifest.json`, or icons** — otherwise installed users keep the stale cached version (SW also runtime-caches any same-origin asset on first fetch).
- **`manifest.json`**: PWA manifest, `start_url: "index.html"`.
- All UI text is Chinese — keep new strings Chinese.

## Data (localStorage, no server)

- Keys: `my_account_data` (array of records), `my_account_settings` (`{fixedIncomeAmount}`).
- Record shape: `{ id, desc, amount, type: 'expense'|'income', date: 'YYYY-MM-DD', createdAt: ISO string }`.
- `loadData()` returns `[]` on corrupt/absent JSON. There is no schema migration — when adding fields, keep fallbacks (`item.desc || '…'`) so old records render.
- Fixed-income dedup matches `desc === '固定收入'` + type `income` + `date` startsWith current month. Changing that literal breaks the dedup.
- `getToday()` uses `new Date().toISOString()` — **UTC date**. For UTC+8 users, records entered near midnight get the previous day's date. Don't "fix" this casually; date filtering is string comparison on `YYYY-MM-DD`.
- Version string (currently "v1.1") appears in the About modal and the onload `console.log` — keep both in sync.
- Amount input accepts commas (`1,234.56`); commas are stripped before `parseFloat`.
