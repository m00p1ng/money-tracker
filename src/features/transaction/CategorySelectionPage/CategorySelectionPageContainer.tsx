import { CategorySelectionPage } from './CategorySelectionPage'
import { useCategorySelectionPage } from './useCategorySelectionPage'

export function CategorySelectionPageContainer() {
  const props = useCategorySelectionPage()
  return <CategorySelectionPage {...props} />
}
