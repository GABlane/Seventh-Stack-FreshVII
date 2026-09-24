import { useEffect, useState, type PropsWithChildren } from 'react'
import { paletteOptions, type PaletteId } from '../data/palettes'
import { ThemeContext } from './theme-context'

function getSavedPalette(): PaletteId {
  const saved = localStorage.getItem('freshvii-palette')
  return paletteOptions.some((option) => option.id === saved) ? saved as PaletteId : 'fresh'
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [paletteId, setPaletteId] = useState<PaletteId>(getSavedPalette)
  const palette = paletteOptions.find((option) => option.id === paletteId) ?? paletteOptions[0]

  useEffect(() => {
    localStorage.setItem('freshvii-palette', paletteId)
    document.documentElement.dataset.palette = paletteId
  }, [paletteId])

  return <ThemeContext.Provider value={{ paletteId, palette, setPalette: setPaletteId }}>{children}</ThemeContext.Provider>
}
