import { createContext } from 'react'
import { paletteOptions, type PaletteId } from '../data/palettes'

export type ThemeContextValue = {
  paletteId: PaletteId
  palette: (typeof paletteOptions)[number]
  setPalette: (paletteId: PaletteId) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
