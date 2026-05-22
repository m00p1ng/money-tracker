import { Link } from 'react-router'
import { Card } from '../../components/ui/Card'
import { themes } from '../../lib/theme'
import { useSettingsStore } from '../../stores/settingsStore'
import type { ThemePreset } from '../../types/domain'

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

  return (
    <div className="space-y-5">
      <header><Link className="text-sm text-accent" to="/settings">Back</Link><h1 className="mt-3 text-2xl font-semibold">Theme</h1></header>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(themes) as ThemePreset[]).map((theme) => (
          <button key={theme} className={`rounded-lg border p-4 text-left ${selected === theme ? 'border-[var(--accent)]' : 'border-white/10'}`} type="button" onClick={() => settings ? update({ ...settings, theme }) : undefined}>
            <span className="mb-3 block h-8 w-8 rounded-full" style={{ background: themes[theme].accent }} />
            <span>{names[theme]}</span>
          </button>
        ))}
      </div>
      <Card>
        <p className="text-sm text-slate-400">Preview</p>
        <p className="mt-2 font-medium">Cash Wallet</p>
      </Card>
    </div>
  )
}
