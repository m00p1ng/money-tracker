import { Icon } from '@/components/Icon'
import { themes } from '@/lib/theme'
import { formatAmount } from '@/lib/format'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWalletStore } from '@/stores/walletStore'
import type { ThemePreset } from '@/types/domain'
import { useBackNavigate } from '@/context/navigationDirection'

const names: Record<ThemePreset, string> = {
  forest: 'Forest',
  midnight: 'Midnight',
  ocean: 'Ocean',
  sunset: 'Sunset',
  amber: 'Amber',
  arctic: 'Arctic',
  sakura: 'Sakura',
  void: 'Void',
}

export function ThemePage() {
  const settings = useSettingsStore((state) => state.settings)
  const update = useSettingsStore((state) => state.update)
  const selected = settings?.theme ?? 'forest'
  const firstWallet = useWalletStore((state) => state.items[0])
  const previewAccent = themes[selected].accent
  const previewAccentLight = themes[selected].accentLight
  const backNavigate = useBackNavigate()

  return (
    <div className="space-y-5">
      <header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
        <button
          aria-label="Back"
          onClick={() => backNavigate('/settings')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300"
          type="button"
        >
          <Icon name="fa-chevron-left" />
        </button>
        <h1 className="text-center text-base font-bold">Theme</h1>
        <div />
      </header>

      <div>
        <p className="mb-2 pl-1 text-[11px] uppercase tracking-[1.5px] text-white/30">Choose a preset</p>
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/[0.04]">
          <div className="grid grid-cols-4 gap-2 p-3.5">
            {(Object.keys(themes) as ThemePreset[]).map((theme) => (
              <button
                key={theme}
                type="button"
                className={`rounded-xl border-2 py-2.5 px-2 text-center ${selected === theme ? 'border-accent' : 'border-transparent'}`}
                onClick={() => settings ? update({ ...settings, theme }) : undefined}
              >
                <span
                  className="mx-auto mb-1.5 block h-9 w-9 rounded-full"
                  style={{ background: `linear-gradient(135deg,${themes[theme].accentBtn1},${themes[theme].accent})` }}
                />
                <span className={`text-[10px] font-semibold ${selected === theme ? 'text-accent' : 'text-white/50'}`}>
                  {names[theme]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {firstWallet && (
        <div>
          <p className="mb-2 pl-1 text-[11px] uppercase tracking-[1.5px] text-white/30">Preview</p>
          <div
            className="flex items-center gap-3 rounded-2xl border p-4"
            style={{ background: 'rgba(5,15,9,0.9)', borderColor: `${previewAccent}33` }}
          >
            <div
              className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[13px] text-lg text-white"
              style={{
                background: `linear-gradient(135deg,${themes[selected].accentBtn1},${previewAccent})`,
                boxShadow: `0 4px 14px ${previewAccent}66`,
              }}
            >
              <Icon name={firstWallet.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{firstWallet.name}</p>
              <p className="mt-0.5 text-xs text-white/35">{firstWallet.type === 'credit_card' ? 'Credit Card' : 'Payment Account'} · {firstWallet.currency}</p>
            </div>
            <span className="text-base font-bold" style={{ color: previewAccentLight }}>
              {formatAmount(firstWallet.balance, firstWallet.currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
