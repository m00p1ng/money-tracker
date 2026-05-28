import { AnimatePresence, motion } from 'framer-motion'

type BottomSheetProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            key="backdrop"
            aria-label="Close bottom sheet"
            className="fixed inset-0 z-40 border-0 bg-black/65 p-0 backdrop-blur-sm"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className={[
              'fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-107.5',
              'rounded-t-3xl border-t border-white/10 bg-(--bg) pb-8',
              'shadow-[0_-8px_40px_rgba(0,0,0,0.5)]',
            ].join(' ')}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 36,
              mass: 0.9,
            }}
          >
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <h3 className="px-5 pb-3 pt-3 text-center text-base font-bold tracking-tight">{title}</h3>
            <div
              className="mx-5 mb-3 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 50%, transparent)' }}
            />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
