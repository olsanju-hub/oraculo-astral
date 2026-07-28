import { describe, expect, it } from 'vitest'
import { circularDistance, longitudeToSign, normalizeLongitude } from './zodiac'

describe('zodiac utilities', () => {
  it('normalizes longitude into the zodiac circle', () => {
    expect(normalizeLongitude(-1)).toBe(359)
    expect(normalizeLongitude(361)).toBe(1)
  })

  it('maps longitude to sign and degree', () => {
    expect(longitudeToSign(33).sign).toBe('Tauro')
    expect(longitudeToSign(359.5).sign).toBe('Piscis')
  })

  it('calculates circular distance across zero Aries', () => {
    expect(circularDistance(358, 2)).toBe(4)
  })
})
