import { createContext, type ReactNode, useContext, useState } from 'react'
import {
  authenticateUser,
  clearStoredUser,
  getStoredUser,
  storeUser,
  type PlannerUser,
} from './auth'

interface AuthContextValue {
  currentUser: PlannerUser | null
  login(userId: string, password: string): boolean
  logout(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PlannerUser | null>(() => getStoredUser())

  function login(userId: string, password: string): boolean {
    const user = authenticateUser(userId, password)
    if (!user) return false
    storeUser(user)
    setCurrentUser(user)
    return true
  }

  function logout() {
    clearStoredUser()
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
