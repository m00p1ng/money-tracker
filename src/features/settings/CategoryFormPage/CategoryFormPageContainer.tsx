import { CategoryFormPage } from './CategoryFormPage'
import { useCategoryFormPage } from './useCategoryFormPage'

export function CategoryFormPageContainer() {
  const props = useCategoryFormPage()

  return <CategoryFormPage {...props} />
}
