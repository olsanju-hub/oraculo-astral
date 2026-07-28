import type { Aspect, CelestialBodyId, PlanetPosition } from '../types'
import { circularDistance } from './zodiac'

const aspectDefinitions = [
  { kind: 'conjunction', label: 'Conjunción', angle: 0, baseOrb: 8, tone: 'neutral' },
  { kind: 'opposition', label: 'Oposición', angle: 180, baseOrb: 8, tone: 'tense' },
  { kind: 'trine', label: 'Trígono', angle: 120, baseOrb: 7, tone: 'harmonic' },
  { kind: 'square', label: 'Cuadratura', angle: 90, baseOrb: 7, tone: 'tense' },
  { kind: 'sextile', label: 'Sextil', angle: 60, baseOrb: 5, tone: 'harmonic' },
  { kind: 'quincunx', label: 'Quincuncio', angle: 150, baseOrb: 3, tone: 'neutral' },
  { kind: 'semisextile', label: 'Semisextil', angle: 30, baseOrb: 2, tone: 'neutral' },
  { kind: 'semisquare', label: 'Semicuadratura', angle: 45, baseOrb: 2, tone: 'tense' },
  { kind: 'sesquisquare', label: 'Sesquicuadratura', angle: 135, baseOrb: 2, tone: 'tense' },
] as const

const luminaries = new Set<CelestialBodyId>(['sun', 'moon'])
const angles = new Set<CelestialBodyId>(['ascendant', 'descendant', 'midheaven', 'imum-coeli'])

export function calculateAspects(positions: PlanetPosition[]): Aspect[] {
  const relevant = positions.filter((position) => position.id !== 'south-node')
  const aspects: Aspect[] = []

  for (let i = 0; i < relevant.length; i += 1) {
    for (let j = i + 1; j < relevant.length; j += 1) {
      const first = relevant[i]
      const second = relevant[j]
      const actualAngle = circularDistance(first.longitude, second.longitude)
      for (const definition of aspectDefinitions) {
        const orbLimit = getOrbLimit(definition.baseOrb, first.id, second.id)
        const orb = Math.abs(actualAngle - definition.angle)
        if (orb <= orbLimit) {
          aspects.push({
            id: `${first.id}-${definition.kind}-${second.id}`,
            kind: definition.kind,
            label: definition.label,
            from: first.id,
            to: second.id,
            exactAngle: definition.angle,
            actualAngle,
            orb,
            tone: definition.tone,
          })
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb)
}

function getOrbLimit(baseOrb: number, first: CelestialBodyId, second: CelestialBodyId) {
  let orb = baseOrb
  if (luminaries.has(first) || luminaries.has(second)) orb += 1.5
  if (angles.has(first) || angles.has(second)) orb += 1
  return orb
}
