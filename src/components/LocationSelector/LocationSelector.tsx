import { ArrowLeft, Check, MapPin } from 'lucide-react'
import type { GeoResult } from '../../core/types'

export function LocationSelector({
  locations,
  selected,
  onSelect,
  onBack,
  onContinue,
}: {
  locations: GeoResult[]
  selected: GeoResult | null
  onSelect: (location: GeoResult) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div className="location-selector">
      <div className="section-heading">
        <MapPin size={18} />
        <h2>Selecciona la ubicación correcta</h2>
      </div>
      <p className="form-note">
        Si hay varias coincidencias, debes elegir una explícitamente antes de calcular la carta.
      </p>
      <div className="location-list" role="listbox" aria-label="Resultados geográficos">
        {locations.map((location) => (
          <button
            key={location.id}
            type="button"
            className={`location-option ${selected?.id === location.id ? 'selected' : ''}`}
            onClick={() => onSelect(location)}
          >
            <span>
              <strong>{location.locality}</strong>
              <small>{[location.municipality, location.region, location.country].filter(Boolean).join(' · ')}</small>
              <code>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} · {location.timezone}</code>
            </span>
            {selected?.id === location.id && <Check size={18} />}
          </button>
        ))}
      </div>
      <div className="actions">
        <button className="ghost-button" type="button" onClick={onBack}>
          <ArrowLeft size={16} /> Volver
        </button>
        <button className="primary-button" type="button" disabled={!selected} onClick={onContinue}>
          Continuar
        </button>
      </div>
    </div>
  )
}
