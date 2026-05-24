import { SettingsPage } from './SettingsPage'
import { useSettingsPage } from './useSettingsPage'

export function SettingsPageContainer() {
  const props = useSettingsPage()

  return <SettingsPage {...props} />
}
