import { useCategorySelectionPage } from './useCategorySelectionPage'
import { CategorySelectionPage } from './CategorySelectionPage'

export function CategorySelectionPageContainer() {
  const props = useCategorySelectionPage()
  return <CategorySelectionPage {...props} />
}
