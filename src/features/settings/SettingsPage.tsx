import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { useCategoryStore } from '../../stores/categoryStore'
import { useCurrencyStore } from '../../stores/currencyStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useWalletStore } from '../../stores/walletStore'

type SettingRowProps = {
  icon: string
  iconBg: string
  iconColor: string
  label: string
  sub?: string
  value?: string
  to: string
}

function SettingRow({ icon, iconBg, iconColor, label, sub, value, to }: SettingRowProps) {
  return (
    <Link to={to} className="flex items-center gap-3.5 border-b border-white/5 px-4 py-3.5 last:border-b-0 active:bg-white/[0.03]">
      <div
        className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] text-sm"
        style={{ background: iconBg, color: iconColor }}
      >
        <Icon name={icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-white/35">{sub}</p>}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 text-white/25">
        {value && <span className="text-[13px] font-medium text-white/45">{value}</span>}
        <Icon name="fa-chevron-right" className="text-[11px]" />
      </div>
    </Link>
  )
}

function SettingsGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 pl-1 text-[11px] uppercase tracking-[1.5px] text-white/30">{label}</p>
      <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/[0.04]">
        {children}
      </div>
    </div>
  )
}

const THEME_LABELS: Record<string, string> = {
  forest: 'Forest Green',
  midnight: 'Midnight Purple',
  ocean: 'Ocean Blue',
  sunset: 'Sunset Rose',
  amber: 'Amber',
  arctic: 'Arctic',
  sakura: 'Sakura',
  void: 'Void',
}

const THEME_COLORS: Record<string, string> = {
  forest: '#10b981',
  midnight: '#a855f7',
  ocean: '#38bdf8',
  sunset: '#fb7185',
  amber: '#fbbf24',
  arctic: '#94a3b8',
  sakura: '#f9a8d4',
  void: '#374151',
}

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings)
  const wallets = useWalletStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const currencies = useCurrencyStore((state) => state.items)

  const walletCount = wallets.length
  const categoryCount = categories.length
  const currencyCodes = currencies.slice(0, 3).map((c) => c.code).join(' · ')
  const theme = settings?.theme ?? 'forest'
  const themeColor = THEME_COLORS[theme] ?? '#10b981'

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-slate-400">Preferences</p>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <SettingsGroup label="Wallets & Data">
        <SettingRow
          icon="fa-wallet"
          iconBg="rgba(16,185,129,0.15)"
          iconColor="#34d399"
          label="Wallets"
          sub={`${walletCount} account${walletCount !== 1 ? 's' : ''}`}
          to="/settings/wallets"
        />
        <SettingRow
          icon="fa-tag"
          iconBg="rgba(168,85,247,0.15)"
          iconColor="#a855f7"
          label="Categories"
          sub={`${categoryCount} categories`}
          to="/settings/categories"
        />
        <SettingRow
          icon="fa-coins"
          iconBg="rgba(56,189,248,0.15)"
          iconColor="#38bdf8"
          label="Currencies"
          sub={currencyCodes || undefined}
          to="/settings/currencies"
        />
      </SettingsGroup>

      <SettingsGroup label="Appearance">
        <Link to="/settings/theme" className="flex items-center gap-3.5 px-4 py-3.5 active:bg-white/[0.03]">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] text-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
            <Icon name="fa-palette" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Theme</p>
            <p className="mt-0.5 text-xs text-white/35">{THEME_LABELS[theme]}</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 text-white/25">
            <span className="text-base" style={{ color: themeColor }}>●</span>
            <Icon name="fa-chevron-right" className="text-[11px]" />
          </div>
        </Link>
      </SettingsGroup>

      <SettingsGroup label="General">
        <SettingRow
          icon="fa-earth-asia"
          iconBg="rgba(245,158,11,0.15)"
          iconColor="#f59e0b"
          label="Language"
          value="English"
          to="/settings"
        />
        <SettingRow
          icon="fa-calendar-days"
          iconBg="rgba(255,255,255,0.07)"
          iconColor="#aaa"
          label="Date Format"
          value="DD MMM YYYY"
          to="/settings"
        />
      </SettingsGroup>
    </div>
  )
}
