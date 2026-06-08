import { createContext, useContext, useState, type ReactNode } from 'react'

interface BackgroundCtx {
  bgImage: string
  setBgImage: (name: string) => void
}

const Ctx = createContext<BackgroundCtx>({ bgImage: 'WWTP.png', setBgImage: () => {} })

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [bgImage, setBgImage] = useState('WWTP.png')
  return <Ctx.Provider value={{ bgImage, setBgImage }}>{children}</Ctx.Provider>
}

export const useBackground = () => useContext(Ctx)
