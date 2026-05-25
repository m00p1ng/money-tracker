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

interface SettingsPageProps {
  walletCount: number
  categoryCount: number
  currencyCode: string | undefined
  theme: string
}

export function SettingsPage({
  walletCount,
  categoryCount,
  currencyCode,
  theme,
}: SettingsPageProps) {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      <ListGroup label="Wallets & Data">
        <ListRow
          icon="fa-wallet"
          label="Wallets"
          sub={`${walletCount} account${walletCount !== 1
            ? 's'
            : ''}`}
          to="/settings/wallets"
        />
        <ListRow
          icon="fa-tag"
          label="Categories"
          sub={`${categoryCount} categories`}
          to="/settings/categories"
        />
        <ListRow
          icon="fa-coins"
          label="Currencies"
          sub={currencyCode || undefined}
          to="/settings/currencies"
        />
      </ListGroup>

      <ListGroup label="Appearance">
        <ListRow
          icon="fa-palette"
          label="Theme"
          sub={THEME_LABELS[theme]}
          to="/settings/theme"
        />
      </ListGroup>

      <ListGroup label="General">
        <ListRow
          icon="fa-earth-asia"
          label="Language"
          to="/settings"
          trailing={
            <div className="flex items-center gap-2 text-white/25">
              <span className="text-[15px] font-medium text-white/45">English</span>
              <Icon name="fa-chevron-right" className="text-base" />
            </div>
          }
        />
        <ListRow
          icon="fa-calendar-days"
          label="Date Format"
          to="/settings"
          trailing={
            <div className="flex items-center gap-2 text-white/25">
              <span className="text-[15px] font-medium text-white/45">DD MMM YYYY</span>
              <Icon name="fa-chevron-right" className="text-base" />
            </div>
          }
        />
      </ListGroup>
    </div>
  )
}
