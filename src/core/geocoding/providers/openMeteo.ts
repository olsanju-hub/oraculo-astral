import { z } from 'zod'
import type { GeocoderProvider, GeoResult } from '../../types'

const openMeteoResponseSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        country: z.string().optional(),
        country_code: z.string().optional(),
        admin1: z.string().optional(),
        admin2: z.string().optional(),
        admin3: z.string().optional(),
        admin4: z.string().optional(),
        timezone: z.string().optional(),
      }),
    )
    .optional(),
})

export const openMeteoGeocoder: GeocoderProvider = {
  id: 'open-meteo',
  label: 'Open-Meteo Geocoding',
  async search(query) {
    const params = new URLSearchParams({
      name: query.city,
      count: '12',
      language: query.language ?? 'es',
      format: 'json',
    })
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
    if (!response.ok) {
      throw new Error('No se pudo consultar el servicio geográfico.')
    }
    const parsed = openMeteoResponseSchema.parse(await response.json())
    const countryNeedle = query.country?.trim().toLocaleLowerCase('es')
    const results = (parsed.results ?? [])
      .filter((result) => {
        if (!countryNeedle) return true
        return result.country?.toLocaleLowerCase('es').includes(countryNeedle)
      })
      .map<GeoResult>((result) => {
        const region = [result.admin4, result.admin3, result.admin2, result.admin1]
          .filter(Boolean)
          .join(', ')
        const country = result.country ?? query.country ?? ''
        return {
          id: `${openMeteoGeocoder.id}:${result.id}`,
          label: [result.name, region, country].filter(Boolean).join(' · '),
          locality: result.name,
          municipality: result.admin3 ?? result.admin4,
          region: result.admin1 ?? result.admin2,
          country,
          countryCode: result.country_code,
          latitude: result.latitude,
          longitude: result.longitude,
          timezone: result.timezone ?? 'UTC',
          provider: openMeteoGeocoder.id,
          raw: result,
        }
      })

    if (results.length === 0) {
      throw new Error('No encontramos una ubicación fiable. Prueba con otra localidad o usa coordenadas manuales.')
    }

    return results
  },
}
