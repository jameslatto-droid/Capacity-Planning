/**
 * Generates data/plan.seed.json from the TypeScript seed files.
 * Run: node --import tsx/esm server/generate-seed.mjs
 */

import { seedResources } from '../src/data/seed/resources.ts'
import { seedProjects }  from '../src/data/seed/projects.ts'
import { seedAllocations } from '../src/data/seed/allocations.ts'
import { seedScenarios } from '../src/data/seed/scenarios.ts'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(join(root, 'data'), { recursive: true })

const seed = {
  resources:   seedResources,
  projects:    seedProjects,
  allocations: seedAllocations,
  scenarios:   seedScenarios,
  lastModified: new Date().toISOString(),
}

const file = join(root, 'data', 'plan.seed.json')
writeFileSync(file, JSON.stringify(seed, null, 2), 'utf8')
console.log('Seed data written to', file)
