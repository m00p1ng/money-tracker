import cx from 'classnames'

import { BottomSheet, Icon } from '@/components'
import { ICON_OPTIONS } from '@/lib'

interface IconPickerProps {
  isOpen: boolean
  selectedIcon: string
  onSelect: (icon: string) => void
  onClose: () => void
}

export function IconPicker({
  isOpen,
  selectedIcon,
  onSelect,
  onClose,
}: IconPickerProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Icon">
      <div className="max-h-72 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-6 gap-2">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              type="button"
              aria-label={icon}
              onClick={() => {
                onSelect(icon)
                onClose()
              }}
              className={cx(
                'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                icon === selectedIcon
                  ? 'border border-(--accent)/30 bg-(--accent)/12 text-(--accent-light)'
                  : 'bg-white/5 text-white/60 hover:bg-white/10',
              )}
            >
              <Icon name={icon} />
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}
