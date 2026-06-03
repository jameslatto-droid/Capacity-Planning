# Engineering Resource Planner — Shared Server Setup

This branch (`server`) turns the app into a portable team server.
One person runs it; everyone else connects via their browser.

## Requirements

- **Node.js** (LTS) installed on the host machine — https://nodejs.org
- The host machine must be accessible on the local network (office LAN or VPN)

## First run (host machine)

1. Copy this entire folder to the shared drive or network location
2. Double-click **`start.bat`** (Windows) or run `bash start.sh` (Mac/Linux)
3. The first run automatically:
   - Installs npm dependencies
   - Builds the app
   - Initialises `data/plan.json` from seed data
4. The console will print two URLs:

```
  Local:    http://localhost:3001
  Network:  http://192.168.1.42:3001  ← share this with your team
```

5. Share the **Network** URL with your team. They open it in any browser.

## Every subsequent run

Just double-click **`start.bat`**. Leave the window open while the team is using it.

## Team access

| Who | What they do |
|-----|--------------|
| Host (one person) | Runs `start.bat`, keeps it open |
| Everyone else | Opens the Network URL in their browser |

All changes save to `data/plan.json` on the host machine in real time.
Everyone sees the same data — just refresh the browser to pick up changes others made.

## Simultaneous editing

The server handles concurrent saves — the last save wins.
For a **weekly planning session** where you work through the plan together on one screen,
this is fine. If two people save the same data at exactly the same second,
one save will overwrite the other (no merge conflicts, last-writer-wins).

## Reset to seed data

Run `reset-data.bat` (or `cp data/plan.seed.json data/plan.json` on Mac/Linux),
then refresh all browsers. This wipes all changes and restores the original seed data.

## Backup

`data/plan.json` is the only file that changes. Back it up by copying it elsewhere.
You can also use **Reports → Export JSON** from within the app.

## Changing the port

Set the `PORT` environment variable before starting:

```bat
set PORT=8080
node server\index.js
```

Or edit `start.bat` to add `set PORT=8080` before the `node` line.

## Moving to a real server later

When you're ready to host on a proper server, this same `server/index.js` 
runs on any Node.js host (Linux VPS, Windows Server, Docker).
Just point `data/plan.json` at a persistent volume and you're done.
