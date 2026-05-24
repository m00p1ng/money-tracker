import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faDeleteLeft,
  faDivide,
  faEquals,
  faMinus,
  faPlusMinus,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import cx from 'classnames'

const keys = [
  '+', '1', '2', '3', 'THB',
  '-', '4', '5', '6', '±',
  '×', '7', '8', '9', '=',
  '÷', '.', '0', '⌫',
]

const keyIcons: Record<string, IconDefinition> = {
  '+': faPlus,
  '-': faMinus,
  '×': faXmark,
  '÷': faDivide,
  '±': faPlusMinus,
  '=': faEquals,
  '⌫': faDeleteLeft,
}

interface CalculatorKeyboardProps {
  onPress: (key: string) => void
  onDismiss?: () => void
}

export function CalculatorKeyboard({ onPress, onDismiss }: CalculatorKeyboardProps) {
  return (
    <div className="border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl">
      {onDismiss && (
        <div className="mx-auto mb-2 flex max-w-107.5 justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className={[
              'flex items-center gap-1.5 rounded-lg border border-white/10',
              'bg-white/5 px-3 py-1 text-[11px] font-medium text-white/40',
            ].join(' ')}
          >
            Done
          </button>
        </div>
      )}
      <div className="mx-auto grid max-w-107.5 grid-cols-5 gap-2">
        {keys.map((key) => {
          const isOperator = ['+', '-', '×', '÷'].includes(key)
          const isAccent = ['±', '=', 'THB'].includes(key)
          const isDelete = key === '⌫'
          const icon = keyIcons[key]
          const accentKeyClass = 'border border-[var(--accent)]/30 bg-[var(--accent)]/25 text-white disabled:opacity-50'
          return (
            <button
              key={key}
              className={cx('h-12 rounded-lg text-lg font-semibold', {
                'col-span-2 border border-danger/20 bg-danger/10 text-danger': isDelete,
                'border border-(--accent)/25 bg-(--accent)/15 text-accent-light': !isDelete && isOperator,
                [accentKeyClass]: !isDelete && !isOperator && isAccent,
                'border border-white/6 bg-white/[0.07] text-slate-100': !isDelete && !isOperator && !isAccent,
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
