import {
  Asteroid,
  CalculationFlag,
  HouseSystem as SweHouseSystem,
  LunarPoint,
  Planet,
  SwissEphemeris,
} from '@swisseph/browser'
import type { BirthInput, BirthTimeResolution, GeoResult, HouseSystem, NatalChart, PlanetPosition } from '../types'
import { calculateAspects } from './aspects'
import { longitudeToSign, normalizeLongitude } from './zodiac'

const planetMap: Array<{ id: PlanetPosition['id']; label: string; body: Planet | LunarPoint | Asteroid; optional?: boolean }> = [
  { id: 'sun', label: 'Sol', body: Planet.Sun },
  { id: 'moon', label: 'Luna', body: Planet.Moon },
  { id: 'mercury', label: 'Mercurio', body: Planet.Mercury },
  { id: 'venus', label: 'Venus', body: Planet.Venus },
  { id: 'mars', label: 'Marte', body: Planet.Mars },
  { id: 'jupiter', label: 'Júpiter', body: Planet.Jupiter },
  { id: 'saturn', label: 'Saturno', body: Planet.Saturn },
  { id: 'uranus', label: 'Urano', body: Planet.Uranus },
  { id: 'neptune', label: 'Neptuno', body: Planet.Neptune },
  { id: 'pluto', label: 'Plutón', body: Planet.Pluto },
  { id: 'north-node', label: 'Nodo Norte', body: LunarPoint.TrueNode },
  { id: 'lilith', label: 'Lilith', body: LunarPoint.MeanApogee, optional: true },
  { id: 'chiron', label: 'Quirón', body: Asteroid.Chiron, optional: true },
]

const houseSystemMap: Record<HouseSystem, SweHouseSystem> = {
  placidus: SweHouseSystem.Placidus,
  'whole-sign': SweHouseSystem.WholeSign,
  equal: SweHouseSystem.Equal,
  porphyry: SweHouseSystem.Porphyrius,
}

export async function calculateNatalChart(options: {
  input: BirthInput
  location: GeoResult
  birthTime: BirthTimeResolution
  houseSystem: HouseSystem
}): Promise<NatalChart> {
  const swe = new SwissEphemeris()
  await swe.init()
  const ephemerisMode = await resolveEphemerisMode(swe)
  const calculationFlag =
    ephemerisMode === 'swiss-files' ? CalculationFlag.SwissEphemeris | CalculationFlag.Speed : CalculationFlag.MoshierEphemeris | CalculationFlag.Speed

  const jd = swe.dateToJulianDay(new Date(options.birthTime.utcIso))
  const housesResult = swe.calculateHouses(
    jd,
    options.location.latitude,
    options.location.longitude,
    houseSystemMap[options.houseSystem],
  )

  const positions = planetMap.flatMap(({ id, label, body, optional }) => {
    try {
      const calculated = swe.calculatePosition(jd, body, calculationFlag)
      return [toPlanetPosition(id, label, calculated.longitude, calculated.latitude, calculated.longitudeSpeed)]
    } catch (error) {
      if (optional) return []
      throw new Error(`No se pudo calcular ${label} con el motor astronómico actual.`, { cause: error })
    }
  })
  const northNode = positions.find((position) => position.id === 'north-node')
  const southNode = northNode ? toPlanetPosition('south-node', 'Nodo Sur', northNode.longitude + 180) : null

  const ascendant = toPlanetPosition('ascendant', 'Ascendente', housesResult.ascendant)
  const midheaven = toPlanetPosition('midheaven', 'Medio Cielo', housesResult.mc)
  const descendant = toPlanetPosition('descendant', 'Descendente', housesResult.ascendant + 180)
  const imumCoeli = toPlanetPosition('imum-coeli', 'Fondo del Cielo', housesResult.mc + 180)
  const enrichedPositions = assignHouses(
    [...positions, ...(southNode ? [southNode] : []), ascendant, descendant, midheaven, imumCoeli],
    housesResult.cusps,
  )

  const houses = Array.from({ length: 12 }, (_, index) => {
    const longitude = normalizeLongitude(housesResult.cusps[index + 1])
    const sign = longitudeToSign(longitude)
    return {
      house: index + 1,
      longitude,
      sign: sign.sign,
      formatted: sign.formatted,
    }
  })

  swe.close()

  return {
    input: options.input,
    location: options.location,
    birthTime: options.birthTime,
    houseSystem: options.houseSystem,
    ephemerisMode,
    positions: enrichedPositions,
    houses,
    aspects: calculateAspects(enrichedPositions),
    balance: calculateBalance(enrichedPositions),
  }
}

async function resolveEphemerisMode(swe: SwissEphemeris): Promise<NatalChart['ephemerisMode']> {
  try {
    await swe.loadStandardEphemeris()
    return 'swiss-files'
  } catch {
    return 'moshier-fallback'
  }
}

function toPlanetPosition(
  id: PlanetPosition['id'],
  label: string,
  longitude: number,
  latitude?: number,
  speed?: number,
): PlanetPosition {
  const normalized = normalizeLongitude(longitude)
  const sign = longitudeToSign(normalized)
  return {
    id,
    label,
    longitude: normalized,
    latitude,
    speed,
    retrograde: typeof speed === 'number' ? speed < 0 : undefined,
    sign: sign.sign,
    degreeInSign: sign.degreeInSign,
    formatted: sign.formatted,
  }
}

function assignHouses(positions: PlanetPosition[], cusps: number[]) {
  return positions.map((position) => ({
    ...position,
    house: findHouse(position.longitude, cusps),
  }))
}

function findHouse(longitude: number, cusps: number[]) {
  for (let house = 1; house <= 12; house += 1) {
    const start = normalizeLongitude(cusps[house])
    const end = normalizeLongitude(cusps[house === 12 ? 1 : house + 1])
    if (start < end && longitude >= start && longitude < end) return house
    if (start > end && (longitude >= start || longitude < end)) return house
  }
  return 12
}

function calculateBalance(positions: PlanetPosition[]): NatalChart['balance'] {
  const elements = { Fuego: 0, Tierra: 0, Aire: 0, Agua: 0 }
  const modalities = { Cardinal: 0, Fijo: 0, Mutable: 0 }
  const weighted = positions.filter((position) => !['descendant', 'imum-coeli'].includes(position.id))
  weighted.forEach((position) => {
    const sign = longitudeToSign(position.longitude)
    elements[sign.element] += position.id === 'sun' || position.id === 'moon' || position.id === 'ascendant' ? 2 : 1
    modalities[sign.modality] += position.id === 'sun' || position.id === 'moon' || position.id === 'ascendant' ? 2 : 1
  })
  const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0][0]
  const dominantModality = Object.entries(modalities).sort((a, b) => b[1] - a[1])[0][0]
  return { elements, modalities, dominants: [dominantElement, dominantModality] }
}
