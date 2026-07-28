import type { GeocoderProvider, GeoResult, GeoSearchQuery } from '../types'
import { openMeteoGeocoder } from './providers/openMeteo'

const providers: Record<string, GeocoderProvider> = {
  [openMeteoGeocoder.id]: openMeteoGeocoder,
}

export function getGeocoderProvider(providerId = openMeteoGeocoder.id): GeocoderProvider {
  const provider = providers[providerId]
  if (!provider) {
    throw new Error(`Proveedor geográfico no configurado: ${providerId}`)
  }
  return provider
}

export async function searchLocations(query: GeoSearchQuery, providerId?: string): Promise<GeoResult[]> {
  return getGeocoderProvider(providerId).search(query)
}
