import { useEffect } from 'react'

const DEFAULT_BG = 'WWTP.png'

export function usePageBackground(imageName: string) {
  useEffect(() => {
    const base = import.meta.env.BASE_URL as string
    const set = (name: string) =>
      document.documentElement.style.setProperty('--app-bg-url', `url("${base}assets/${name}")`)
    set(imageName)
    return () => set(DEFAULT_BG)
  }, [imageName])
}
