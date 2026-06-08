import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeCtx {
  theme: Theme
  toggle: () => void
  isDark: boolean
}

const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {}, isDark: true })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('erp:theme') as Theme) ?? 'dark'
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    if (theme === 'dark') {
      root.style.setProperty('--app-bg-url', `url("${import.meta.env.BASE_URL}assets/WWTP.png")`)
    } else {
      root.style.removeProperty('--app-bg-url')
    }
    localStorage.setItem('erp:theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return <Ctx.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
