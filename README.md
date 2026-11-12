# Nirob LifeOS: Your Personal Offline Assistant

Phase 1: Home dashboard, Salary & OT, Finance, Savings & DPS, JSON backup/restore, CSV export.
Plain HTML/CSS/JS. No libraries, no CDN, no network calls. Data lives in IndexedDB on your device.

## Files
index.html, style.css, app.js (UI), db.js (IndexedDB), manifest.json, service-worker.js, 

## Install on Android
1. Host the folder over HTTPS (e.g. GitHub Pages, Netlify) or run `python3 -m http.server` and open `localhost`. The first visit needs internet to cache the app.
2. Open the URL in Chrome > menu > "Install app" / "Add to Home screen".
3. After that it works fully offline (airplane mode).

## Updating
Edit files, bump `CACHE` in service-worker.js (e.g. `lifeos-v2`), redeploy. Old caches are deleted; your IndexedDB data is never touched. If DB structure changes, bump VERSION in db.js and only add stores/indexes.

## APK later
Use Bubblewrap (TWA) or PWABuilder with your HTTPS URL; or wrap the folder with Capacitor.

## Backup
More > Export backup (JSON). Files are NOT encrypted. Import validates the file, asks confirmation, and restores atomically (all-or-nothing).

## Known limitations (Phase 1)
- PIN lock not built yet (planned; a PIN would only hide the UI, not encrypt data).
- One employee/profile only. DPS uses simple monthly compounding (estimate only).
- Income totals come from Finance transactions; OT/salary figures are tracked separately and not auto-posted as income.
- Not yet tested on a real device; run the checklist before relying on it.
