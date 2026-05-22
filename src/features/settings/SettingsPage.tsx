import { Link } from 'react-router'
import { Card } from '../../components/ui/Card'
import { useSettingsStore } from '../../stores/settingsStore'

function SettingsLink({ label, value, to }: { label: string; value?: string; to: string }) {
  return (
    <Link to={to}>
      <Card className="mb-3 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-sm text-slate-400">{value ? `${value} ›` : '›'}</span>
      </Card>
    </Link>
  )
}

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings)

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-slate-400">Preferences</p>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Wallets & Data</h2>
        <SettingsLink label="Wallets" to="/settings/wallets" />
        <SettingsLink label="Categories" to="/settings/categories" />
        <SettingsLink label="Currencies" to="/settings/currencies" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Appearance</h2>
        <SettingsLink label="Theme" value={settings?.theme ?? 'forest'} to="/settings/theme" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">General</h2>
        <Card className="mb-3 flex items-center justify-between"><span>Language</span><span className="text-sm text-slate-400">English</span></Card>
        <Card className="flex items-center justify-between"><span>Date Format</span><span className="text-sm text-slate-400">DD MMM YYYY</span></Card>
      </section>
    </div>
  )
}