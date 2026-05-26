import { CategoryEditPage } from './CategoryEditPage'
import { useCategoryEditPage } from './useCategoryEditPage'

export function CategoryEditPageContainer() {
  const props = useCategoryEditPage()
  if (!props) return null
  return <CategoryEditPage {...props} />
}
