import { motion } from 'framer-motion'
import { LoaderCircle } from 'lucide-react'

export function CalculationProgress({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  return (
    <div className="calculation-progress" aria-live="polite">
      <motion.div
        className="progress-orbit"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
      >
        <LoaderCircle size={32} />
      </motion.div>
      <ol>
        {steps.map((step, index) => (
          <li key={step} className={index <= activeIndex ? 'active' : ''}>
            <span />
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}
