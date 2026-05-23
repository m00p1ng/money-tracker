import { useBackNavigate } from '@/context/navigationDirection'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWalletStore } from '@/stores/walletStore'
import type { ThemePreset } from '@/types/domain'

export function useThemePage() {
  const settings = useSettingsStore((state) => state.settings)
  const update = useSettingsStore((state) => state.update)
  const selected: ThemePreset = settings?.theme ?? 'forest'
  const firstWallet = useWalletStore((state) => state.items[0])
  const backNavigate = useBackNavigate()

  function onSelectTheme(theme: ThemePreset) {
    if (settings) {
      update({ ...settings, theme })
    }
  }

  return {
    selected,
    firstWallet,
    onBack: () => backNavigate('/settings'),
    onSelectTheme,
  }
}
