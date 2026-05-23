import {
  Icon,
  ListGroup,
  ListRow,
} from '@/components'

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

interface SettingsPageProps {
  walletCount: number
  categoryCount: number
  currencyCodes: string
  theme: string
}

export function SettingsPage({ walletCount, categoryCount, currencyCodes, theme }: SettingsPageProps) {
  const themeColor = THEME_COLORS[theme] ?? '#10b981'

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <ListGroup label="Wallets & Data">
        <ListRow icon="fa-wallet" iconBg="rgba(16,185,129,0.15)" iconColor="#34d399" label="Wallets" sub={`${walletCount} account${walletCount !== 1 ? 's' : ''}`} to="/settings/wallets" />
        <ListRow icon="fa-tag" iconBg="rgba(168,85,247,0.15)" iconColor="#a855f7" label="Categories" sub={`${categoryCount} categories`} to="/settings/categories" />
        <ListRow icon="fa-coins" iconBg="rgba(56,189,248,0.15)" iconColor="#38bdf8" label="Currencies" sub={currencyCodes || undefined} to="/settings/currencies" />
      </ListGroup>

      <ListGroup label="Appearance">
        <ListRow
          icon="fa-palette"
          iconBg="rgba(16,185,129,0.15)"
          iconColor="#34d399"
          label="Theme"
          sub={THEME_LABELS[theme]}
          to="/settings/theme"
          trailing={
            <div className="flex items-center gap-2 text-white/25">
              <span className="text-base" style={{ color: themeColor }}>●</span>
              <Icon name="fa-chevron-right" className="text-[11px]" />
            </div>
          }
        />
      </ListGroup>

      <ListGroup label="General">
        <ListRow
          icon="fa-earth-asia"
          iconBg="rgba(245,158,11,0.15)"
          iconColor="#f59e0b"
          label="Language"
          to="/settings"
          trailing={
            <div className="flex items-center gap-2 text-white/25">
              <span className="text-[13px] font-medium text-white/45">English</span>
              <Icon name="fa-chevron-right" className="text-[11px]" />
            </div>
          }
        />
        <ListRow
          icon="fa-calendar-days"
          iconBg="rgba(255,255,255,0.07)"
          iconColor="#aaa"
          label="Date Format"
          to="/settings"
          trailing={
            <div className="flex items-center gap-2 text-white/25">
              <span className="text-[13px] font-medium text-white/45">DD MMM YYYY</span>
              <Icon name="fa-chevron-right" className="text-[11px]" />
            </div>
          }
        />
      </ListGroup>
    </div>
  )
}
