import { CategoriesPage } from './CategoriesPage'
import { useCategoriesPage } from './useCategoriesPage'

export function CategoriesPageContainer() {
  const props = useCategoriesPage()
  return <CategoriesPage {...props} />
}
