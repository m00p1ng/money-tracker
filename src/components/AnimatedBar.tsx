import { motion } from 'framer-motion'

import { formatSignedAmount } from '@/lib'

type AnimatedBarProps = {
  value: number
  maxValue: number
  colorFrom: string
  colorTo: string
  textColor: string
  currency: string
  delay?: number
}

export function AnimatedBar({
  value,
  maxValue,
  colorFrom,
  colorTo,
  textColor,
  currency,
  delay = 0,
}: AnimatedBarProps) {
  const widthPercent = maxValue > 0
    ? `${Math.min((value / maxValue) * 100, 100)}%`
    : '0%'
  const label = formatSignedAmount(value, currency)

  return (
    <div
      className="relative h-8 overflow-hidden border border-white/5 rounded-md"
      style={{ background: textColor }}
    >
      <span
        className="absolute inset-0 flex items-center px-4 text-sm font-semibold"
        style={{ color: colorTo, whiteSpace: 'nowrap' }}
      >
        {label}
      </span>
      <motion.div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
        }}
        initial={{ width: 0 }}
        animate={{ width: widthPercent }}
        transition={{
          type: 'spring',
          stiffness: 80,
          damping: 20,
          delay,
        }}
      >
        <span
          className="flex h-full items-center px-4 text-sm font-semibold"
          style={{
            color: textColor,
            minWidth: 'max-content',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </motion.div>
    </div>
  )
}
