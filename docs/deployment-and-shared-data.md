# Deployment And Shared Data

## GitHub Pages

The app can be hosted on GitHub Pages as a static Vite build. The workflow in `.github/workflows/deploy-pages.yml` builds `dist` and deploys it when `main` is pushed.

In the GitHub repository settings, set Pages source to **GitHub Actions**.

The deployed URL will be under:

```text
https://jameslatto-droid.github.io/Capacity-Planning/
```

The app uses hash routing so direct refreshes work on GitHub Pages:

```text
https://jameslatto-droid.github.io/Capacity-Planning/#/allocations
```

## Shared Data

GitHub Pages only serves static files. It cannot provide a shared writable dataset, locking, or conflict prevention. `localStorage` data is private to each browser, so it is useful for solo testing only.

The app should use GitHub Pages for the frontend and Supabase for shared planner data. In Supabase mode, all users read and write the same `planner_state` row containing:

- resources
- projects
- allocations
- scenarios
- leave entries

Run `docs/supabase-setup.sql` once in the Supabase SQL editor before enabling the deployed app. The app will create the initial `main` planner row from seed data when it first loads against an empty table.

Required frontend environment variables:

```text
VITE_STORAGE_MODE=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

For GitHub Pages, set these as repository secrets and expose them only to the build step in `.github/workflows/deploy-pages.yml`.

The current app already has an `ApiPlannerRepository` interface. A backend can expose:

```text
GET /api/resources
PUT /api/resources
GET /api/projects
PUT /api/projects
GET /api/allocations
PUT /api/allocations
GET /api/scenarios
PUT /api/scenarios
GET /api/leave
PUT /api/leave
```

For production, prefer versioned saves rather than blind `PUT` writes.

## Conflict Control

Use two layers.

### 1. Optimistic Concurrency

Each record has a numeric `version`.

On save:

- Client sends the edited record and the version it originally loaded.
- Server compares that version with the current stored version.
- If the version matches, server saves, increments version, and broadcasts an update.
- If the version differs, server returns `409 Conflict` with the current record.

The UI should then show:

```text
This was changed by Onur at 12:34. Reload or review before saving.
```

### 2. Soft Locks

When a user starts editing a high-risk item, request a lock:

```text
POST /api/locks
{
  "resourceKey": "project:p-taqa:allocations:s-baseline",
  "userId": "jim"
}
```

The backend grants the lock only if there is no active lock or the previous lock expired.

Recommended lock behavior:

- Lock duration: 30 seconds.
- Client renews every 10 seconds while editing.
- Lock releases on save, cancel, navigation, or timeout.
- Other users see a read-only banner: `Jim is editing this allocation plan`.
- If the lock expires, another user can take it.

Start with project allocation locks at `project + scenario` level. That is simple and protects the highest-conflict workflow.

## Save Indicators

Use these states in the UI:

- `Unsaved changes`: local edits exist.
- `Saving...`: request in flight.
- `Saved by Jim just now`: successful save.
- After 3-5 seconds, collapse to `Saved 12:34`.
- `Updated by Onur just now`: realtime backend update received from another user.
- `Locked by Dion`: another active edit session owns the lock.
