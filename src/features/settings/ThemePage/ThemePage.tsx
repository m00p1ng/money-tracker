import cx from 'classnames'

import { Icon } from '@/components'
import { themes } from '@/lib'
import type { ThemePreset } from '@/types/domain'

const names: Record<ThemePreset, string> = {
  forest: 'Forest',
  midnight: 'Midnight',
  ocean: 'Ocean',
  sunset: 'Sunset',
  amber: 'Amber',
  arctic: 'Arctic',
  sakura: 'Sakura',
  void: 'Void',
  jade: 'Jade',
}

interface ThemePageProps {
  selected: ThemePreset
  onBack: () => void
  onSelectTheme: (theme: ThemePreset) => void
}

export function ThemePage({
  selected,
  onBack,
  onSelectTheme,
}: ThemePageProps) {
  return (
    <div className="space-y-5">
      <header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
        <button
          aria-label="Back"
          onClick={onBack}
          className={[
            'flex h-9 w-9 cursor-pointer items-center justify-center',
            'rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 active:scale-95',
          ].join(' ')}
          type="button"
        >
          <Icon name="fa-chevron-left" />
        </button>
        <h1 className="text-center text-base font-bold">Theme</h1>
        <div />
      </header>

      <div>
        <p className="mb-2 pl-1 text-sm uppercase tracking-[1.5px] text-white/30">Choose a preset</p>
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
          <div className="grid grid-cols-3 gap-2 p-3.5">
            {(Object.keys(themes) as ThemePreset[]).map((theme) => (
              <button
                key={theme}
                type="button"
                className={cx(
                  'cursor-pointer rounded-xl border-2 py-2.5 px-2 text-center active:scale-95',
                  selected === theme
                    ? 'border-accent bg-accent/5'
                    : 'border-transparent hover:border-white/15',
                )}
                onClick={() => onSelectTheme(theme)}
              >
                <span
                  className="mx-auto mb-1.5 block h-15 w-15 rounded-full"
                  style={{ background: `linear-gradient(135deg,${themes[theme].accentBtn1},${themes[theme].accent})` }}
                />
                <span className={cx('text-sm font-semibold', selected === theme
                  ? 'text-accent'
                  : 'text-white/50')}>
                  {names[theme]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
