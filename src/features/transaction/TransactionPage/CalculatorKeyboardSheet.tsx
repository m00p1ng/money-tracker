import { AnimatePresence, motion } from 'framer-motion'

import { CalculatorKeyboard } from '@/features/transaction/CalculatorKeyboard'

interface CalculatorKeyboardSheetProps {
  isOpen: boolean
  onPress: (key: string) => void
}

export function CalculatorKeyboardSheet({
  isOpen,
  onPress,
}: CalculatorKeyboardSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="keyboard"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 35,
          }}
          className="fixed bottom-0 left-1/2 z-30 w-full max-w-107.5 -translate-x-1/2"
          onClick={(event) => event.stopPropagation()}
        >
          <CalculatorKeyboard onPress={onPress} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
