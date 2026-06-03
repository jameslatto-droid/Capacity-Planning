/**
 * Engineering Resource Planner — Portable Server
 *
 * Serves the built React app and persists planning data to a local JSON file.
 * Run from the project root: node server/index.js
 */

const express  = require('express')
const path     = require('path')
const fs       = require('fs')
const os       = require('os')
const { exec } = require('child_process')

const app      = express()
const PORT     = process.env.PORT || 3001
const DATA_DIR = path.join(__dirname, '..', 'data')
const DATA_FILE = path.join(DATA_DIR, 'plan.json')
const SEED_FILE = path.join(DATA_DIR, 'plan.seed.json')
const DIST_DIR  = path.join(__dirname, '..', 'dist')

// ── Helpers ─────────────────────────────────────────────────────────────────

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    }
  } catch (e) {
    console.warn('Warning: could not read plan.json, returning seed data.', e.message)
  }
  // Fall back to seed data on first run or corruption
  return JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'))
}

function writeKey(key, value) {
  const data = readData()
  data[key] = value
  data.lastModified = new Date().toISOString()
  fs.mkdirSync(DATA_DIR, { recursive: true })
  // Write atomically: write to temp file then rename
  const tmp = DATA_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tmp, DATA_FILE)
}

function getNetworkAddress() {
  const interfaces = os.networkInterfaces()
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface ?? []) {
      if (alias.family === 'IPv4' && !alias.internal) return alias.address
    }
  }
  return null
}

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json({ limit: '20mb' }))

// Serve the built React app
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
} else {
  console.error('\n  ERROR: dist/ folder not found. Run "npm run build:server" first.\n')
}

// ── API routes ───────────────────────────────────────────────────────────────

const KEYS = ['resources', 'projects', 'allocations', 'scenarios']

for (const key of KEYS) {
  // GET /api/:key → returns array
  app.get(`/api/${key}`, (req, res) => {
    try {
      const data = readData()
      res.json(data[key] ?? [])
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // PUT /api/:key → replaces array
  app.put(`/api/${key}`, (req, res) => {
    try {
      writeKey(key, req.body)
      res.json({ ok: true, savedAt: new Date().toISOString() })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}

// Reset to seed data
app.post('/api/reset', (req, res) => {
  try {
    fs.copyFileSync(SEED_FILE, DATA_FILE)
    res.json({ ok: true, message: 'Data reset to seed.' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, dataFile: DATA_FILE, exists: fs.existsSync(DATA_FILE) })
})

// SPA fallback — send index.html for all non-API routes
app.get('*', (req, res) => {
  const index = path.join(DIST_DIR, 'index.html')
  if (fs.existsSync(index)) {
    res.sendFile(index)
  } else {
    res.status(503).send('App not built yet. Run "npm run build:server" first.')
  }
})

// ── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  const network = getNetworkAddress()
  const local   = `http://localhost:${PORT}`
  const net     = network ? `http://${network}:${PORT}` : null

  console.log('\n ╔══════════════════════════════════════════╗')
  console.log(' ║   Engineering Resource Planner           ║')
  console.log(' ╚══════════════════════════════════════════╝')
  console.log(`\n  Local:    ${local}`)
  if (net) console.log(`  Network:  ${net}  ← share with your team`)
  console.log(`\n  Data:     ${DATA_FILE}`)
  console.log('\n  Press Ctrl+C to stop.\n')

  // Open browser on the host machine automatically
  const url = local
  const cmd = process.platform === 'win32' ? `start ${url}`
            : process.platform === 'darwin' ? `open ${url}`
            : `xdg-open ${url}`
  setTimeout(() => exec(cmd), 800)
})
