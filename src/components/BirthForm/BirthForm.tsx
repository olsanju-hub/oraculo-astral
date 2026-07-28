import { Calendar, Clock, Globe2, MapPinned, UserRound } from 'lucide-react'
import { z } from 'zod'
import type { BirthInput } from '../../core/types'

const birthSchema = z.object({
  name: z.string().min(2),
  date: z.string().min(10),
  time: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
})

export function BirthForm({ onSubmit }: { onSubmit: (input: BirthInput) => void | Promise<void> }) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const parsed = birthSchema.safeParse(Object.fromEntries(form))
    if (!parsed.success) return
    onSubmit(parsed.data)
  }

  return (
    <form className="birth-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <UserRound size={18} />
        <h2>Tus datos de nacimiento</h2>
      </div>
      <label>
        <span>Nombre</span>
        <input name="name" autoComplete="name" placeholder="Nombre" required />
      </label>
      <div className="field-grid">
        <label>
          <span><Calendar size={14} /> Fecha</span>
          <input name="date" type="date" required />
        </label>
        <label>
          <span><Clock size={14} /> Hora exacta</span>
          <input name="time" type="time" required />
        </label>
      </div>
      <div className="field-grid">
        <label>
          <span><MapPinned size={14} /> Localidad</span>
          <input name="city" placeholder="Madrid" autoComplete="address-level2" required />
        </label>
        <label>
          <span><Globe2 size={14} /> País</span>
          <input name="country" placeholder="España" autoComplete="country-name" required />
        </label>
      </div>
      <p className="form-note">
        La consulta geográfica solo enviará localidad y país para encontrar coordenadas y zona horaria IANA.
      </p>
      <button className="primary-button" type="submit">Buscar ubicación</button>
    </form>
  )
}
