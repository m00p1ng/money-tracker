import {
  Icon,
  ListGroup,
  ListRow,
  PageHeader,
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
  categoryCount: number
  currencyCode: string | undefined
  theme: string
}

export function SettingsPage({
  categoryCount,
  currencyCode,
  theme,
}: SettingsPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" />

      <ListGroup label="Wallets & Data">
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
