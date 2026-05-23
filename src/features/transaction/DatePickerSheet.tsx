import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

export function DatePickerSheet({
  value,
  onChange,
  onClose,
}: {
  value: Date
  onChange: (date: Date) => void
  onClose: () => void
}) {
  const [selectedDay, setSelectedDay] = useState<Date>(value)
  const [hour, setHour] = useState(value.getHours())
  const [minute, setMinute] = useState(value.getMinutes())

  function handleConfirm() {
    const result = new Date(selectedDay)
    result.setHours(hour, minute, 0, 0)
    onChange(result)
    onClose()
  }

  return (
    <AnimatePresence>
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
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/[0.08] bg-[#131320] pb-8"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15" />
        <h3 className="px-5 pb-2.5 pt-3.5 text-center text-[15px] font-bold">Date & Time</h3>
        <div className="mx-5 mb-2.5 h-px bg-white/[0.06]" />

        {/* Calendar */}
        <div className="flex justify-center px-4">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={(day) => { if (day) setSelectedDay(day) }}
            classNames={{
              root: 'rdp-custom',
              months: 'flex flex-col',
              month: 'space-y-2',
              month_caption: 'flex justify-center items-center gap-2 py-1',
              caption_label: 'text-sm font-semibold text-white',
              nav: 'flex items-center gap-1',
              button_next: 'h-7 w-7 flex items-center justify-center rounded-lg bg-white/[0.06] text-white/60 hover:bg-white/[0.1]',
              button_previous: 'h-7 w-7 flex items-center justify-center rounded-lg bg-white/[0.06] text-white/60 hover:bg-white/[0.1]',
              month_grid: 'w-full',
              weekdays: 'flex justify-around',
              weekday: 'text-[11px] font-semibold text-white/30 w-8 text-center',
              week: 'flex justify-around mt-1',
              day: 'text-center',
              day_button: 'h-8 w-8 rounded-lg text-sm font-medium text-white/70 hover:bg-white/[0.07] flex items-center justify-center',
              selected: 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]',
              today: 'font-bold text-white',
              outside: 'text-white/20',
            }}
          />
        </div>

        {/* Time picker */}
        <div className="mx-4 mt-3 flex items-center justify-center gap-3">
          <select
            aria-label="Hour"
            className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-sm font-medium text-white outline-none"
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
            ))}
          </select>
          <span className="text-lg font-bold text-white/40">:</span>
          <select
            aria-label="Minute"
            className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-sm font-medium text-white outline-none"
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
          >
            {[0, 15, 30, 45].map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
          </select>
        </div>

        {/* Confirm */}
        <button
          className="mx-4 mt-4 w-[calc(100%-2rem)] rounded-2xl py-3.5 text-center text-[15px] font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 40%, transparent)',
          }}
          onClick={handleConfirm}
          type="button"
        >
          Confirm
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
