import { AnimatePresence, motion } from 'framer-motion'

type BottomSheetProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-3xl border-t border-white/[0.08] bg-[var(--bg)] pb-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 38 }}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15" />
            <h3 className="px-5 pb-2.5 pt-3.5 text-center text-[15px] font-bold">{title}</h3>
            <div className="mx-5 mb-2.5 h-px bg-white/[0.06]" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
