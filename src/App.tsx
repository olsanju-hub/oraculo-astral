import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Compass, Download, MapPin, Moon, ShieldCheck, Sparkles, Sun } from 'lucide-react'
import { useMemo, useState } from 'react'
import './index.css'
import { BirthForm } from './components/BirthForm/BirthForm'
import { CalculationProgress } from './components/CalculationProgress/CalculationProgress'
import { LocationSelector } from './components/LocationSelector/LocationSelector'
import { ResultsPanel } from './components/ResultsPanel/ResultsPanel'
import { ZodiacWheel } from './components/ZodiacWheel/ZodiacWheel'
import { calculateNatalChart } from './core/astrology/natalChart'
import { searchLocations } from './core/geocoding/geocoder'
import type { BirthInput, GeoResult, NatalChart } from './core/types'
import { buildInterpretation } from './core/interpretation/interpretationEngine'
import { resolveBirthTime } from './core/timezone/timezoneService'

type Step = 'intro' | 'location' | 'confirm' | 'calculating' | 'results'

const progressSteps = [
  'Buscando ubicación...',
  'Calculando UTC...',
  'Calculando posiciones planetarias...',
  'Calculando casas...',
  'Calculando aspectos...',
  'Interpretando la carta...',
  'Construyendo la rueda...',
]

function App() {
  const [step, setStep] = useState<Step>('intro')
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null)
  const [locations, setLocations] = useState<GeoResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<GeoResult | null>(null)
  const [chart, setChart] = useState<NatalChart | null>(null)
  const [progressIndex, setProgressIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  const interpretation = useMemo(() => (chart ? buildInterpretation(chart) : null), [chart])

  async function handleBirthSubmit(input: BirthInput) {
    setBirthInput(input)
    setStep('location')
    const results = await searchLocations({
      city: input.city,
      country: input.country,
      language: 'es',
    })
    setLocations(results)
    if (results.length === 1) {
      setSelectedLocation(results[0])
    }
  }

  async function handleCalculate() {
    if (!birthInput || !selectedLocation) return
    setStep('calculating')
    setProgressIndex(0)

    const tick = async (index: number) => {
      setProgressIndex(index)
      await new Promise((resolve) => window.setTimeout(resolve, prefersReducedMotion ? 80 : 280))
    }

    await tick(1)
    const birthTime = resolveBirthTime(birthInput, selectedLocation)
    await tick(2)
    const natalChart = await calculateNatalChart({
      input: birthInput,
      location: selectedLocation,
      birthTime,
      houseSystem: 'placidus',
    })
    await tick(5)
    setChart(natalChart)
    await tick(6)
    setStep('results')
  }

  return (
    <main className="app-shell">
      <AstralBackdrop />
      <section className="hero-panel" aria-labelledby="app-title">
        <motion.div
          className="brand-mark"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src="/brand/carta-astral.png" alt="" />
        </motion.div>
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={16} /> Carta natal profesional</p>
          <h1 id="app-title">Oráculo Astral</h1>
          <p>
            Genera una carta natal completa con ubicación verificada, zona horaria histórica,
            rueda interactiva e informe editorial listo para imprimir.
          </p>
        </div>
      </section>

      <section className="workspace">
        <div className="workflow-panel">
          <div className="privacy-note">
            <ShieldCheck size={18} />
            <span>Solo la búsqueda geográfica consulta un servicio externo. Tus datos natales permanecen en este dispositivo.</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div key="form" {...fadeIn}>
                <BirthForm onSubmit={handleBirthSubmit} />
              </motion.div>
            )}

            {step === 'location' && birthInput && (
              <motion.div key="location" {...fadeIn}>
                <LocationSelector
                  locations={locations}
                  selected={selectedLocation}
                  onSelect={setSelectedLocation}
                  onBack={() => setStep('intro')}
                  onContinue={() => setStep('confirm')}
                />
              </motion.div>
            )}

            {step === 'confirm' && birthInput && selectedLocation && (
              <motion.div key="confirm" className="confirm-card" {...fadeIn}>
                <div className="section-heading">
                  <Compass size={18} />
                  <h2>Confirma los datos</h2>
                </div>
                <dl>
                  <div><dt>Nombre</dt><dd>{birthInput.name}</dd></div>
                  <div><dt>Fecha y hora local</dt><dd>{birthInput.date} · {birthInput.time}</dd></div>
                  <div><dt>Lugar</dt><dd>{selectedLocation.label}</dd></div>
                  <div><dt>Coordenadas</dt><dd>{selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}</dd></div>
                  <div><dt>Zona horaria IANA</dt><dd>{selectedLocation.timezone}</dd></div>
                </dl>
                <div className="actions">
                  <button className="ghost-button" onClick={() => setStep('location')}>Cambiar ubicación</button>
                  <button className="primary-button" onClick={handleCalculate}>Generar carta</button>
                </div>
              </motion.div>
            )}

            {step === 'calculating' && (
              <motion.div key="calculating" {...fadeIn}>
                <CalculationProgress steps={progressSteps} activeIndex={progressIndex} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="chart-panel">
          {chart ? (
            <ZodiacWheel chart={chart} />
          ) : (
            <div className="empty-wheel">
              <Sun className="sun" size={42} />
              <Moon className="moon" size={28} />
              <p>La rueda aparecerá al confirmar tu nacimiento.</p>
            </div>
          )}
        </div>
      </section>

      {step === 'results' && chart && interpretation && (
        <section className="results-shell">
          <div className="section-heading">
            <MapPin size={18} />
            <h2>Lectura integrada</h2>
            <button className="ghost-button icon-button" type="button" aria-label="Exportar PDF">
              <Download size={18} />
            </button>
          </div>
          <ResultsPanel chart={chart} interpretation={interpretation} />
        </section>
      )}
    </main>
  )
}

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: 'easeOut' },
} as const

function AstralBackdrop() {
  return (
    <div className="astral-backdrop" aria-hidden="true">
      <div className="starfield starfield-a" />
      <div className="starfield starfield-b" />
      <svg className="constellation-lines" viewBox="0 0 1200 800">
        <path d="M102 168 L188 116 L274 154 L338 98" />
        <path d="M824 138 L902 190 L988 150 L1076 228" />
        <path d="M154 646 L234 596 L328 642 L414 584" />
        <path d="M794 622 L884 572 L982 614 L1082 556" />
      </svg>
    </div>
  )
}

export default App
