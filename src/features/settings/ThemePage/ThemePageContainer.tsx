import { ThemePage } from './ThemePage'
import { useThemePage } from './useThemePage'

export function ThemePageContainer() {
  const props = useThemePage()

  return <ThemePage {...props} />
}
