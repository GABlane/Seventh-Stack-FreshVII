export const paletteOptions = [
  { id: 'fresh', label: 'Fresh', description: 'Teal and ocean blue', header: '#EEFAFD', border: '#CDE6ED', accent: '#145D72' },
  { id: 'garden', label: 'Garden', description: 'Sage and olive', header: '#f3f7ef', border: '#dce9de', accent: '#355342' },
  { id: 'sunrise', label: 'Sunrise', description: 'Coral and apricot', header: '#fff5e8', border: '#f4d6b5', accent: '#673c35' },
] as const

export type PaletteId = (typeof paletteOptions)[number]['id']
