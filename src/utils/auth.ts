export type PlannerUserId = 'onur' | 'tim' | 'dion' | 'jim'

export interface PlannerUser {
  id: PlannerUserId
  displayName: string
  initials: string
}

interface PresetUser extends PlannerUser {
  password: string
}

export const PRESET_USERS: PresetUser[] = [
  { id: 'onur', displayName: 'Onur', initials: 'OK', password: 'onur2026' },
  { id: 'tim', displayName: 'Tim', initials: 'TI', password: 'tim2026' },
  { id: 'dion', displayName: 'Dion', initials: 'DI', password: 'dion2026' },
  { id: 'jim', displayName: 'Jim', initials: 'JI', password: 'jim2026' },
]

const AUTH_KEY = 'erp:current-user'

function publicUser(user: PresetUser): PlannerUser {
  return { id: user.id, displayName: user.displayName, initials: user.initials }
}

function storageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function authenticateUser(userId: string, password: string): PlannerUser | null {
  const user = PRESET_USERS.find((candidate) => candidate.id === userId)
  if (!user || user.password !== password) return null
  return publicUser(user)
}

export function getStoredUser(): PlannerUser | null {
  if (!storageAvailable()) return null
  try {
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PlannerUser
    const user = PRESET_USERS.find((candidate) => candidate.id === parsed.id)
    return user ? publicUser(user) : null
  } catch {
    return null
  }
}

export function storeUser(user: PlannerUser): void {
  if (!storageAvailable()) return
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  if (!storageAvailable()) return
  window.localStorage.removeItem(AUTH_KEY)
}

export function formatAuditUser(userId?: string): string {
  if (!userId) return 'Unknown'
  return PRESET_USERS.find((user) => user.id === userId)?.displayName ?? userId
}
