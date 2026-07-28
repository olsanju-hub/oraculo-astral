import { describe, expect, it } from 'vitest'
import type { PlanetPosition } from '../types'
import { calculateAspects } from './aspects'

describe('calculateAspects', () => {
  it('calculates real orb for a major aspect', () => {
    const aspects = calculateAspects([position('sun', 10), position('moon', 191.2)])

    expect(aspects[0].kind).toBe('opposition')
    expect(aspects[0].orb).toBeCloseTo(1.2)
    expect(aspects[0].tone).toBe('tense')
  })

  it('uses increased orbs for luminaries', () => {
    const aspects = calculateAspects([position('sun', 10), position('saturn', 19)])

    expect(aspects.some((aspect) => aspect.kind === 'conjunction')).toBe(true)
  })
})

function position(id: PlanetPosition['id'], longitude: number): PlanetPosition {
  return {
    id,
    label: id,
    longitude,
    sign: 'Aries',
    degreeInSign: longitude % 30,
    formatted: `${longitude}`,
  }
}
