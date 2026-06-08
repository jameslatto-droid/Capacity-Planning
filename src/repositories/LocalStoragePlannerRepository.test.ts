import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalStoragePlannerRepository } from './LocalStoragePlannerRepository'
import type { LeaveEntry } from '../types'

function createStorage(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

const leaveEntry: LeaveEntry = {
  id: 'leave-1',
  resourceId: 'r-onur',
  type: 'annual',
  startDate: '2026-07-01',
  endDate: '2026-07-03',
  notes: 'Booked before seed migration',
  createdAt: '2026-06-01T00:00:00.000Z',
}

describe('LocalStoragePlannerRepository', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('preserves leave entries when seed data is refreshed', async () => {
    localStorage.setItem('erp:seed-version', 'old')
    localStorage.setItem('erp:resources', JSON.stringify([{ id: 'legacy-resource' }]))
    localStorage.setItem('erp:leave', JSON.stringify([leaveEntry]))

    const repository = new LocalStoragePlannerRepository()

    await expect(repository.loadLeaveEntries()).resolves.toEqual([leaveEntry])
    expect(localStorage.getItem('erp:resources')).toBeNull()
  })

  it('backs up existing data before a seed refresh', () => {
    localStorage.setItem('erp:seed-version', 'old')
    localStorage.setItem('erp:resources', JSON.stringify([{ id: 'legacy-resource' }]))
    localStorage.setItem('erp:leave', JSON.stringify([leaveEntry]))

    new LocalStoragePlannerRepository()

    const backupKey = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .find((key) => key?.startsWith('erp:migration-backup:old:to:'))

    expect(backupKey).toBeDefined()
    if (!backupKey) throw new Error('Migration backup was not written')

    const backup = JSON.parse(localStorage.getItem(backupKey) ?? '{}') as Record<string, string>
    expect(JSON.parse(backup['erp:resources'] ?? '[]')).toEqual([{ id: 'legacy-resource' }])
    expect(JSON.parse(backup['erp:leave'] ?? '[]')).toEqual([leaveEntry])
  })
})
