import { describe, expect, it } from 'vitest'
import type { NatalChart } from '../types'

describe('NatalChart contract', () => {
  it('tracks ephemeris precision mode explicitly', () => {
    const mode: NatalChart['ephemerisMode'] = 'moshier-fallback'

    expect(['swiss-files', 'moshier-fallback']).toContain(mode)
  })
})
