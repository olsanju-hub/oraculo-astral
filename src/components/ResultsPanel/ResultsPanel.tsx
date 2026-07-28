import type { InterpretationReport, NatalChart } from '../../core/types'

export function ResultsPanel({ chart, interpretation }: { chart: NatalChart; interpretation: InterpretationReport }) {
  return (
    <div className="results-panel">
      <section className="technical-grid">
        <article>
          <h3>Datos técnicos</h3>
          <table>
            <tbody>
              <tr><th>Sistema de casas</th><td>{chart.houseSystem}</td><td /></tr>
              <tr><th>Efemérides</th><td>{chart.ephemerisMode === 'swiss-files' ? 'Swiss Ephemeris' : 'Moshier fallback'}</td><td /></tr>
              <tr><th>UTC</th><td>{chart.birthTime.utcIso}</td><td>{chart.birthTime.offset}</td></tr>
              <tr><th>Zona IANA</th><td>{chart.birthTime.timezone}</td><td /></tr>
            </tbody>
          </table>
        </article>
        <article>
          <h3>Posiciones</h3>
          <table>
            <tbody>
              {chart.positions.map((position) => (
                <tr key={position.id}>
                  <th>{position.label}</th>
                  <td>{position.formatted}</td>
                  <td>{position.house ? `Casa ${position.house}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <article>
          <h3>Aspectos principales</h3>
          <ul className="aspect-list">
            {chart.aspects.slice(0, 12).map((aspect) => (
              <li key={aspect.id}>
                <strong>{aspect.label}</strong>
                <span>{aspect.from} · {aspect.to}</span>
                <code>orbe {aspect.orb.toFixed(2)}°</code>
              </li>
            ))}
          </ul>
        </article>
      </section>
      <article className="interpretation">
        <h3>{interpretation.title}</h3>
        <p className="lead">{interpretation.overview}</p>
        {interpretation.sections.map((section) => (
          <section key={section.id}>
            <h4>{section.title}</h4>
            <p className="section-summary">{section.summary}</p>
            {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
      </article>
    </div>
  )
}
