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

Recommended architecture:

1. Keep GitHub Pages for the frontend.
2. Add a small shared backend for planner data.
3. Store every editable record with `version`, `lastModifiedAt`, and `lastModifiedBy`.
4. Save with optimistic concurrency: the client sends the version it loaded, and the backend rejects stale saves with `409 Conflict`.
5. Add short-lived edit locks for screens where conflict risk is high, especially project allocation editing.

Good backend options:

- Supabase: Postgres, realtime updates, row-level security, simple hosted setup.
- Firebase Firestore: realtime documents and transactions.
- A small Node API on Render/Railway/Azure backed by Postgres.

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
