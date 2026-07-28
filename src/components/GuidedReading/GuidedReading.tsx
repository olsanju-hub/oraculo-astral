import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { InterpretationReport } from '../../core/types'

export function GuidedReading({ interpretation }: { interpretation: InterpretationReport }) {
  const [index, setIndex] = useState(0)
  const section = interpretation.sections[index]

  return (
    <article className="guided-reading" aria-live="polite">
      <div>
        <span className="guide-step">{index + 1} / {interpretation.sections.length}</span>
        <h3>Recorrer mi carta</h3>
      </div>
      <h4>{section.title}</h4>
      <p className="section-summary">{section.summary}</p>
      <p>{section.body[0]}</p>
      <div className="actions">
        <button className="ghost-button" type="button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
          <ChevronLeft size={16} /> Anterior
        </button>
        <button
          className="primary-button"
          type="button"
          disabled={index === interpretation.sections.length - 1}
          onClick={() => setIndex((value) => value + 1)}
        >
          Siguiente <ChevronRight size={16} />
        </button>
      </div>
    </article>
  )
}
