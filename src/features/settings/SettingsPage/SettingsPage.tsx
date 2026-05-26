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
  currencyCode: string | undefined
  theme: string
}

export function SettingsPage({
  currencyCode,
  theme,
}: SettingsPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader title="Settings" />

      <ListGroup label="General">
        <ListRow
          icon="fa-coins"
          label="Currencies"
          to="/settings/currencies"
          trailing={
            <div className="flex items-center gap-2 text-white/25">
              <span className="text-[15px] font-medium text-white/45">{currencyCode}</span>
              <Icon name="fa-chevron-right" className="text-base" />
            </div>
          }
        />
        <ListRow
          icon="fa-palette"
          label="Theme"
          to="/settings/theme"
          trailing={
            <div className="flex items-center gap-2 text-white/25">
              <span className="text-[15px] font-medium text-white/45">{THEME_LABELS[theme]}</span>
              <Icon name="fa-chevron-right" className="text-base" />
            </div>
          }
        />
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
      </ListGroup>
    </div>
  )
}
