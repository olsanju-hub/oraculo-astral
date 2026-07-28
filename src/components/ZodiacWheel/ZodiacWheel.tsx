import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import type { NatalChart } from '../../core/types'
import { zodiacSigns } from '../../core/astrology/zodiac'
import { useState } from 'react'

const radius = 220
const center = 260

export function ZodiacWheel({ chart }: { chart: NatalChart }) {
  const [mode, setMode] = useState<'modern' | 'classic'>('modern')
  const [showAspects, setShowAspects] = useState(true)
  const [showHouses, setShowHouses] = useState(true)
  const [showLabels, setShowLabels] = useState(true)

  return (
    <div className={`zodiac-wheel-shell ${mode}`}>
      <div className="wheel-toolbar" aria-label="Modos de visualización">
        <button className={`chip ${mode === 'modern' ? 'active' : ''}`} onClick={() => setMode('modern')}>Moderna</button>
        <button className={`chip ${mode === 'classic' ? 'active' : ''}`} onClick={() => setMode('classic')}>Clásica</button>
        <button className={`chip ${showAspects ? 'active' : ''}`} onClick={() => setShowAspects((value) => !value)}>Aspectos</button>
        <button className={`chip ${showHouses ? 'active' : ''}`} onClick={() => setShowHouses((value) => !value)}>Casas</button>
        <button className={`chip ${showLabels ? 'active' : ''}`} onClick={() => setShowLabels((value) => !value)}>Etiquetas</button>
      </div>
      <TransformWrapper minScale={0.8} maxScale={2.6} wheel={{ step: 0.08 }} centerOnInit>
        <TransformComponent wrapperClass="wheel-transform">
          <svg className="zodiac-wheel" viewBox="0 0 520 520" role="img" aria-label="Rueda zodiacal interactiva">
            <defs>
              <radialGradient id="wheelGlow">
                <stop offset="0%" stopColor="#fff4cf" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#111827" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={center} cy={center} r="246" className="wheel-outer" />
            <circle cx={center} cy={center} r="206" className="wheel-inner" />
            <circle cx={center} cy={center} r="154" className="wheel-core" />
            <circle cx={center} cy={center} r="120" fill="url(#wheelGlow)" />

            {zodiacSigns.map((sign, index) => {
              const angle = (index * 30 - 90) * (Math.PI / 180)
              const x = center + Math.cos(angle + Math.PI / 12) * 226
              const y = center + Math.sin(angle + Math.PI / 12) * 226
              const x2 = center + Math.cos(angle) * 246
              const y2 = center + Math.sin(angle) * 246
              const x3 = center + Math.cos(angle) * 154
              const y3 = center + Math.sin(angle) * 154
              return (
                <g key={sign.sign}>
                  <line x1={x2} y1={y2} x2={x3} y2={y3} className="wheel-divider" />
                  <text x={x} y={y} className="zodiac-symbol">{sign.symbol}</text>
                </g>
              )
            })}

            {showHouses && chart.houses.map((house) => {
              const angle = (house.longitude - 90) * (Math.PI / 180)
              return (
                <line
                  key={house.house}
                  x1={center + Math.cos(angle) * 118}
                  y1={center + Math.sin(angle) * 118}
                  x2={center + Math.cos(angle) * 206}
                  y2={center + Math.sin(angle) * 206}
                  className="house-line"
                />
              )
            })}

            {showAspects && chart.aspects.slice(0, 34).map((aspect) => {
              const from = chart.positions.find((position) => position.id === aspect.from)
              const to = chart.positions.find((position) => position.id === aspect.to)
              if (!from || !to) return null
              const a1 = (from.longitude - 90) * (Math.PI / 180)
              const a2 = (to.longitude - 90) * (Math.PI / 180)
              return (
                <line
                  key={aspect.id}
                  x1={center + Math.cos(a1) * 118}
                  y1={center + Math.sin(a1) * 118}
                  x2={center + Math.cos(a2) * 118}
                  y2={center + Math.sin(a2) * 118}
                  className={`aspect-line ${aspect.tone}`}
                />
              )
            })}

            {chart.positions.map((position) => {
              const angle = (position.longitude - 90) * (Math.PI / 180)
              const x = center + Math.cos(angle) * radius
              const y = center + Math.sin(angle) * radius
              return (
                <g key={position.id} className={`planet-node ${position.id}`}>
                  <circle cx={x} cy={y} r="14" />
                  <text x={x} y={y + 4}>{planetGlyph(position.id)}</text>
                  {showLabels && <text x={x} y={y + 25} className="planet-label">{position.formatted.split(' ')[1]}</text>}
                </g>
              )
            })}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

function planetGlyph(id: string) {
  return {
    sun: '☉',
    moon: '☽',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇',
    ascendant: 'AC',
    descendant: 'DC',
    midheaven: 'MC',
    'imum-coeli': 'IC',
  }[id] ?? '•'
}
