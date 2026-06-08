import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeCtx {
  theme: Theme
  toggle: () => void
  isDark: boolean
}

const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {}, isDark: true })

function isCinematicPreviewEnabled() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('cinematic') === '1'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const cinematicPreview = isCinematicPreviewEnabled()
  const [theme, setTheme] = useState<Theme>(() =>
    cinematicPreview ? 'dark' : (localStorage.getItem('erp:theme') as Theme) ?? 'dark'
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.classList.toggle('login-theme-preview', cinematicPreview && theme === 'dark')
    root.style.setProperty('--app-bg-url', `url("${import.meta.env.BASE_URL}assets/WWTP.png")`)
    if (!cinematicPreview) localStorage.setItem('erp:theme', theme)
  }, [cinematicPreview, theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return <Ctx.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
