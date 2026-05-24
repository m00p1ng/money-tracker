import { motion } from 'framer-motion'

import { formatAmount } from '@/lib'

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

  return (
    <div className="h-11 overflow-hidden rounded-xl border border-white/5 bg-white/[0.04]">
      <motion.div
        className="flex h-full items-center rounded-xl px-4 text-base font-bold"
        style={{
          background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
          color: textColor,
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
        {formatAmount(value, currency)}
      </motion.div>
    </div>
  )
}
