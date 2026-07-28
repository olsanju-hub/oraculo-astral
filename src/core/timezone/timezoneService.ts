import { Temporal } from '@js-temporal/polyfill'
import tzLookup from '@photostructure/tz-lookup'
import type { BirthInput, BirthTimeResolution, GeoResult } from '../types'

export function resolveTimezoneFromCoordinates(latitude: number, longitude: number) {
  return tzLookup(latitude, longitude)
}

export function resolveBirthTime(input: BirthInput, location: GeoResult): BirthTimeResolution {
  const timezone = location.timezone || resolveTimezoneFromCoordinates(location.latitude, location.longitude)
  const localDateTime = `${input.date}T${input.time}:00`
  const plain = Temporal.PlainDateTime.from(localDateTime)
  const earlier = plain.toZonedDateTime(timezone, { disambiguation: 'earlier' })
  const later = plain.toZonedDateTime(timezone, { disambiguation: 'later' })
  const validWithReject = isValidWithReject(plain, timezone)
  const requestedPlain = plain.toString()
  const earlierPlain = earlier.toPlainDateTime().toString()
  const laterPlain = later.toPlainDateTime().toString()

  const alternatives = Array.from(new Set([earlier.toInstant().toString(), later.toInstant().toString()]))
  const ambiguity: BirthTimeResolution['ambiguity'] =
    earlierPlain !== requestedPlain || laterPlain !== requestedPlain
      ? 'nonexistent'
      : !validWithReject && alternatives.length > 1
        ? 'ambiguous'
        : 'none'

  return {
    timezone,
    localDateTime,
    utcIso: earlier.toInstant().toString(),
    offset: earlier.offset,
    ambiguity,
    alternatives,
  }
}

function isValidWithReject(plain: Temporal.PlainDateTime, timezone: string) {
  try {
    plain.toZonedDateTime(timezone, { disambiguation: 'reject' })
    return true
  } catch {
    return false
  }
}
