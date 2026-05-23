import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DayPicker } from 'react-day-picker'
import Picker from 'react-mobile-picker'
import 'react-day-picker/dist/style.css'

type TimeValue = { hour: string; minute: string }

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTE_OPTIONS = ['00', '15', '30', '45']

function roundMinuteTo15(minute: number): string {
  return String(Math.round(minute / 15) * 15 % 60).padStart(2, '0')
}

export function DatePickerSheet({
  isOpen,
  value,
  onChange,
  onClose,
}: {
  isOpen: boolean
  value: Date
  onChange: (date: Date) => void
  onClose: () => void
}) {
  const [selectedDay, setSelectedDay] = useState<Date>(value)
  const [pickerValue, setPickerValue] = useState<TimeValue>({
    hour: String(value.getHours()).padStart(2, '0'),
    minute: roundMinuteTo15(value.getMinutes()),
  })

  function handleConfirm() {
    const result = new Date(selectedDay)
    result.setHours(Number(pickerValue.hour), Number(pickerValue.minute), 0, 0)
    onChange(result)
    onClose()
  }

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
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/[0.08] bg-[var(--bg)] pb-8"
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
                onSelect={(day) => {
                  if (day) {
                    setSelectedDay(day)
                  }
                }}
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
                  day: 'text-center w-8',
                  day_button: 'h-8 w-8 rounded-lg text-sm font-medium text-white/70 hover:bg-white/[0.07] flex items-center justify-center',
                  selected: 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]',
                  today: 'font-bold text-white',
                  outside: 'text-white/20',
                }}
              />
            </div>

            {/* Time picker wheels */}
            <div className="mx-4 mt-3 grid grid-cols-2 gap-2.5">
              <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
                <p className="pt-2 text-center text-[10px] uppercase tracking-[1px] text-white/30">Hour</p>
                <Picker value={pickerValue} onChange={setPickerValue} height={120} itemHeight={40} wheelMode="natural">
                  <Picker.Column name="hour">
                    {HOUR_OPTIONS.map((opt) => (
                      <Picker.Item key={opt} value={opt}>
                        {({ selected }) => (
                          <span className={`text-[15px] ${selected ? 'font-bold text-white' : 'font-medium text-white/30'}`}>{opt}</span>
                        )}
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.04]">
                <p className="pt-2 text-center text-[10px] uppercase tracking-[1px] text-white/30">Minute</p>
                <Picker value={pickerValue} onChange={setPickerValue} height={120} itemHeight={40} wheelMode="natural">
                  <Picker.Column name="minute">
                    {MINUTE_OPTIONS.map((opt) => (
                      <Picker.Item key={opt} value={opt}>
                        {({ selected }) => (
                          <span className={`text-[15px] ${selected ? 'font-bold text-white' : 'font-medium text-white/30'}`}>{opt}</span>
                        )}
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
              </div>
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
        </>
      )}
    </AnimatePresence>
  )
}
