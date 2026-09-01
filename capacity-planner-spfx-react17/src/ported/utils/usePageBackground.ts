import { useEffect } from 'react'
import { useBackground } from './BackgroundContext'

const DEFAULT_BG = 'WWTP.png'

export function usePageBackground(imageName: string) {
  const { setBgImage } = useBackground()
  useEffect(() => {
    setBgImage(imageName)
    return () => setBgImage(DEFAULT_BG)
  }, [imageName, setBgImage])
}
