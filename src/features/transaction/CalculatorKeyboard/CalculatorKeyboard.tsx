import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cx from 'classnames'
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
              className={cx('h-12 rounded-lg text-lg font-semibold', {
                'col-span-2 border border-danger/20 bg-danger/10 text-danger': isDelete,
                'border border-[var(--accent)]/25 bg-[var(--accent)]/15 text-accent-light': !isDelete && isOperator,
                'border border-[var(--accent)]/30 bg-[var(--accent)]/25 text-white disabled:opacity-50': !isDelete && !isOperator && isAccent,
                'border border-white/[0.06] bg-white/[0.07] text-slate-100': !isDelete && !isOperator && !isAccent,
              })}
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
