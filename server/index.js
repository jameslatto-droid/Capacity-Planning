/**
 * Engineering Resource Planner — Portable Server (ESM)
 * Run: node server/index.js
 */

import express   from 'express'
import path      from 'path'
import fs        from 'fs'
import os        from 'os'
import { exec }  from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app       = express()
const PORT      = process.env.PORT || 3001
const DATA_DIR  = path.join(__dirname, '..', 'data')
const DATA_FILE = path.join(DATA_DIR, 'plan.json')
const SEED_FILE = path.join(DATA_DIR, 'plan.seed.json')
const DIST_DIR  = path.join(__dirname, '..', 'dist')

// ── Helpers ──────────────────────────────────────────────────────────────────

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    }
  } catch (e) {
    console.warn('Warning: could not read plan.json — falling back to seed.', e.message)
  }
  return JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'))
}

function writeKey(key, value) {
  const data = readData()
  data[key] = value
  data.lastModified = new Date().toISOString()
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const tmp = DATA_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tmp, DATA_FILE)
}

function getNetworkAddress() {
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const alias of iface ?? []) {
      if (alias.family === 'IPv4' && !alias.internal) return alias.address
    }
  }
  return null
}

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '20mb' }))

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
} else {
  console.error('\n  ERROR: dist/ not found. Run "npm run build" first.\n')
}

// ── API ───────────────────────────────────────────────────────────────────────

for (const key of ['resources', 'projects', 'allocations', 'scenarios']) {
  app.get(`/api/${key}`, (_req, res) => {
    try { res.json(readData()[key] ?? []) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })
  app.put(`/api/${key}`, (req, res) => {
    try { writeKey(key, req.body); res.json({ ok: true, savedAt: new Date().toISOString() }) }
    catch (e) { res.status(500).json({ error: e.message }) }
  })
}

app.post('/api/reset', (_req, res) => {
  try {
    fs.copyFileSync(SEED_FILE, DATA_FILE)
    res.json({ ok: true, message: 'Data reset to seed.' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, dataFile: DATA_FILE, exists: fs.existsSync(DATA_FILE) })
)

// SPA fallback — catch all non-API routes and serve index.html
app.use((_req, res) => {
  const index = path.join(DIST_DIR, 'index.html')
  fs.existsSync(index)
    ? res.sendFile(index)
    : res.status(503).send('App not built. Run "npm run build" first.')
})

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  const net   = getNetworkAddress()
  const local = `http://localhost:${PORT}`
  const netUrl = net ? `http://${net}:${PORT}` : null

  console.log('\n ╔══════════════════════════════════════════╗')
  console.log(' ║   Engineering Resource Planner           ║')
  console.log(' ╚══════════════════════════════════════════╝')
  console.log(`\n  Local:    ${local}`)
  if (netUrl) console.log(`  Network:  ${netUrl}  <- share with your team`)
  console.log(`\n  Data:     ${DATA_FILE}`)
  console.log('\n  Press Ctrl+C to stop.\n')

  const openCmd = process.platform === 'win32' ? `start ${local}`
                : process.platform === 'darwin' ? `open ${local}`
                : `xdg-open ${local}`
  setTimeout(() => exec(openCmd), 800)
})
