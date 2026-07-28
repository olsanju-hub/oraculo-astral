export type HouseSystem = 'placidus' | 'whole-sign' | 'equal' | 'porphyry'

export type ZodiacSign =
  | 'Aries'
  | 'Tauro'
  | 'Géminis'
  | 'Cáncer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Escorpio'
  | 'Sagitario'
  | 'Capricornio'
  | 'Acuario'
  | 'Piscis'

export type CelestialBodyId =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'north-node'
  | 'south-node'
  | 'chiron'
  | 'lilith'
  | 'ascendant'
  | 'descendant'
  | 'midheaven'
  | 'imum-coeli'

export type AspectKind =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semisextile'
  | 'semisquare'
  | 'sesquisquare'

export interface BirthInput {
  name: string
  date: string
  time: string
  city: string
  country: string
}

export interface GeoSearchQuery {
  city: string
  country?: string
  language?: string
}

export interface GeoResult {
  id: string
  label: string
  locality: string
  municipality?: string
  region?: string
  country: string
  countryCode?: string
  latitude: number
  longitude: number
  timezone: string
  provider: string
  raw?: unknown
}

export interface GeocoderProvider {
  id: string
  label: string
  search(query: GeoSearchQuery): Promise<GeoResult[]>
}

export interface BirthTimeResolution {
  timezone: string
  localDateTime: string
  utcIso: string
  offset: string
  ambiguity: 'none' | 'ambiguous' | 'nonexistent'
  alternatives: string[]
}

export interface PlanetPosition {
  id: CelestialBodyId
  label: string
  longitude: number
  latitude?: number
  speed?: number
  retrograde?: boolean
  sign: ZodiacSign
  degreeInSign: number
  formatted: string
  house?: number
}

export interface HouseCusp {
  house: number
  longitude: number
  sign: ZodiacSign
  formatted: string
}

export interface Aspect {
  id: string
  kind: AspectKind
  label: string
  from: CelestialBodyId
  to: CelestialBodyId
  exactAngle: number
  actualAngle: number
  orb: number
  tone: 'harmonic' | 'tense' | 'neutral'
}

export interface NatalChart {
  input: BirthInput
  location: GeoResult
  birthTime: BirthTimeResolution
  houseSystem: HouseSystem
  positions: PlanetPosition[]
  houses: HouseCusp[]
  aspects: Aspect[]
  balance: {
    elements: Record<'Fuego' | 'Tierra' | 'Aire' | 'Agua', number>
    modalities: Record<'Cardinal' | 'Fijo' | 'Mutable', number>
    dominants: string[]
  }
}

export interface InterpretationSection {
  id: string
  title: string
  summary: string
  body: string[]
  linkedBodies?: CelestialBodyId[]
  linkedAspects?: string[]
}

export interface InterpretationReport {
  title: string
  overview: string
  sections: InterpretationSection[]
}
