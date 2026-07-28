import { CalculationFlag, HouseSystem as SweHouseSystem, Planet, SwissEphemeris } from '@swisseph/browser'
import type { BirthInput, BirthTimeResolution, GeoResult, HouseSystem, NatalChart, PlanetPosition } from '../types'
import { calculateAspects } from './aspects'
import { longitudeToSign, normalizeLongitude } from './zodiac'

const planetMap: Array<{ id: PlanetPosition['id']; label: string; planet: Planet }> = [
  { id: 'sun', label: 'Sol', planet: Planet.Sun },
  { id: 'moon', label: 'Luna', planet: Planet.Moon },
  { id: 'mercury', label: 'Mercurio', planet: Planet.Mercury },
  { id: 'venus', label: 'Venus', planet: Planet.Venus },
  { id: 'mars', label: 'Marte', planet: Planet.Mars },
  { id: 'jupiter', label: 'Júpiter', planet: Planet.Jupiter },
  { id: 'saturn', label: 'Saturno', planet: Planet.Saturn },
  { id: 'uranus', label: 'Urano', planet: Planet.Uranus },
  { id: 'neptune', label: 'Neptuno', planet: Planet.Neptune },
  { id: 'pluto', label: 'Plutón', planet: Planet.Pluto },
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
  await tryLoadSwissFiles(swe)

  const jd = swe.dateToJulianDay(new Date(options.birthTime.utcIso))
  const housesResult = swe.calculateHouses(
    jd,
    options.location.latitude,
    options.location.longitude,
    houseSystemMap[options.houseSystem],
  )

  const positions = planetMap.map(({ id, label, planet }) => {
    const calculated = swe.calculatePosition(jd, planet, CalculationFlag.SwissEphemeris)
    return toPlanetPosition(id, label, calculated.longitude, calculated.latitude, calculated.longitudeSpeed)
  })

  const ascendant = toPlanetPosition('ascendant', 'Ascendente', housesResult.ascendant)
  const midheaven = toPlanetPosition('midheaven', 'Medio Cielo', housesResult.mc)
  const descendant = toPlanetPosition('descendant', 'Descendente', housesResult.ascendant + 180)
  const imumCoeli = toPlanetPosition('imum-coeli', 'Fondo del Cielo', housesResult.mc + 180)
  const enrichedPositions = assignHouses([...positions, ascendant, descendant, midheaven, imumCoeli], housesResult.cusps)

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
    positions: enrichedPositions,
    houses,
    aspects: calculateAspects(enrichedPositions),
    balance: calculateBalance(enrichedPositions),
  }
}

async function tryLoadSwissFiles(swe: SwissEphemeris) {
  try {
    await swe.loadStandardEphemeris()
  } catch {
    // Fallback remains Swiss Ephemeris API with built-in Moshier data; UI and docs will flag precision mode.
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
