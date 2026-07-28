import type { ZodiacSign } from '../types'

export const zodiacSigns: Array<{
  sign: ZodiacSign
  symbol: string
  element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua'
  modality: 'Cardinal' | 'Fijo' | 'Mutable'
}> = [
  { sign: 'Aries', symbol: '♈', element: 'Fuego', modality: 'Cardinal' },
  { sign: 'Tauro', symbol: '♉', element: 'Tierra', modality: 'Fijo' },
  { sign: 'Géminis', symbol: '♊', element: 'Aire', modality: 'Mutable' },
  { sign: 'Cáncer', symbol: '♋', element: 'Agua', modality: 'Cardinal' },
  { sign: 'Leo', symbol: '♌', element: 'Fuego', modality: 'Fijo' },
  { sign: 'Virgo', symbol: '♍', element: 'Tierra', modality: 'Mutable' },
  { sign: 'Libra', symbol: '♎', element: 'Aire', modality: 'Cardinal' },
  { sign: 'Escorpio', symbol: '♏', element: 'Agua', modality: 'Fijo' },
  { sign: 'Sagitario', symbol: '♐', element: 'Fuego', modality: 'Mutable' },
  { sign: 'Capricornio', symbol: '♑', element: 'Tierra', modality: 'Cardinal' },
  { sign: 'Acuario', symbol: '♒', element: 'Aire', modality: 'Fijo' },
  { sign: 'Piscis', symbol: '♓', element: 'Agua', modality: 'Mutable' },
]

export function normalizeLongitude(longitude: number) {
  return ((longitude % 360) + 360) % 360
}

export function longitudeToSign(longitude: number) {
  const normalized = normalizeLongitude(longitude)
  const index = Math.floor(normalized / 30)
  const degreeInSign = normalized - index * 30
  return {
    ...zodiacSigns[index],
    degreeInSign,
    formatted: `${Math.floor(degreeInSign)}°${Math.round((degreeInSign % 1) * 60)
      .toString()
      .padStart(2, '0')}′ ${zodiacSigns[index].sign}`,
  }
}

export function circularDistance(a: number, b: number) {
  const diff = Math.abs(normalizeLongitude(a) - normalizeLongitude(b))
  return diff > 180 ? 360 - diff : diff
}
