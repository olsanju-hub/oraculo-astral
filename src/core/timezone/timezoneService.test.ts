import { describe, expect, it } from 'vitest'
import type { BirthInput, GeoResult } from '../types'
import { resolveBirthTime } from './timezoneService'

const inputBase: BirthInput = {
  name: 'Test',
  date: '2024-10-27',
  time: '02:30',
  city: 'Madrid',
  country: 'España',
}

const madrid: GeoResult = {
  id: 'test:madrid',
  label: 'Madrid · España',
  locality: 'Madrid',
  country: 'España',
  latitude: 40.4168,
  longitude: -3.7038,
  timezone: 'Europe/Madrid',
  provider: 'test',
}

describe('resolveBirthTime', () => {
  it('detects ambiguous daylight-saving times', () => {
    const resolved = resolveBirthTime(inputBase, madrid)

    expect(resolved.ambiguity).toBe('ambiguous')
    expect(resolved.alternatives).toHaveLength(2)
  })

  it('detects nonexistent daylight-saving times', () => {
    const resolved = resolveBirthTime({ ...inputBase, date: '2024-03-31' }, madrid)

    expect(resolved.ambiguity).toBe('nonexistent')
  })

  it('converts historical local time to UTC with an IANA zone', () => {
    const resolved = resolveBirthTime({ ...inputBase, date: '1990-07-15', time: '12:00' }, madrid)

    expect(resolved.utcIso).toBe('1990-07-15T10:00:00Z')
    expect(resolved.offset).toBe('+02:00')
  })
})
