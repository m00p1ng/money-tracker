import { create } from 'zustand'

import { db } from '@/db/schema'
import { applyTheme } from '@/lib'
import type { Settings } from '@/types/domain'

type SettingsStore = {
  settings?: Settings
  load: () => Promise<void>
  update: (settings: Settings) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: undefined,
  async load() {
    const settings = await db.settings.get('default')
    if (settings) {
      applyTheme(settings.theme)
    }
    set({ settings })
  },
  async update(settings) {
    await db.settings.put(settings)
    applyTheme(settings.theme)
    set({ settings })
  },
}))
