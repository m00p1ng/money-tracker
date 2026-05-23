import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDeleteLeft,
  faDivide,
  faEquals,
  faMinus,
  faPlusMinus,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const keys = ['+', '1', '2', '3', 'THB', '-', '4', '5', '6', '±', '×', '7', '8', '9', '=', '÷', '.', '0', '⌫']

const keyIcons: Record<string, IconDefinition> = {
  '+': faPlus,
  '-': faMinus,
  '×': faXmark,
  '÷': faDivide,
  '±': faPlusMinus,
  '=': faEquals,
  '⌫': faDeleteLeft,
}

export function CalculatorKeyboard({ onPress, onDismiss }: { onPress: (key: string) => void; onDismiss?: () => void }) {
  return (
    <div className="border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl">
      {onDismiss && (
        <div className="mx-auto mb-2 flex max-w-[430px] justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-white/40"
          >
            Done
          </button>
        </div>
      )}
      <div className="mx-auto grid max-w-[430px] grid-cols-5 gap-2">
        {keys.map((key) => {
          const isOperator = ['+', '-', '×', '÷'].includes(key)
          const isAccent = ['±', '=', 'THB'].includes(key)
          const isDelete = key === '⌫'
          const icon = keyIcons[key]
          return (
            <button
              key={key}
              className={`h-12 rounded-lg text-lg font-semibold ${isDelete ? 'col-span-2 border border-red-500/20 bg-red-500/10 text-red-400' : isOperator ? 'border border-[var(--accent)]/25 bg-[var(--accent)]/15 text-accent-light' : isAccent ? 'border border-[var(--accent)]/30 bg-[var(--accent)]/25 text-white disabled:opacity-50' : 'border border-white/[0.06] bg-white/[0.07] text-slate-100'}`}
              disabled={false}
              onClick={() => onPress(key)}
              type="button"
            >
              {icon ? <FontAwesomeIcon icon={icon} /> : key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
