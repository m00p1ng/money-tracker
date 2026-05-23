import { Link } from 'react-router'
import { Card } from '../../components/ui/Card'
import { useCategoryStore } from '../../stores/categoryStore'
import { useBackNavigate } from '../../context/navigationDirection'

export function CategoriesPage() {
  const categories = useCategoryStore((state) => state.items)
  const rootCategories = categories.filter((category) => !category.parentId)
  const backNavigate = useBackNavigate()

  return (
    <div className="space-y-5">
      <header>
        <button type="button" className="text-sm text-accent" onClick={() => backNavigate('/settings')}>Back</button>
        <h1 className="mt-3 text-2xl font-semibold">Categories</h1>
      </header>
      {rootCategories.map((category) => (
        <Link key={category.id} to={`/settings/categories/${category.id}`}>
          <Card className="mb-3 flex items-center justify-between">
            <span>{category.name}</span>
            <span className="text-sm text-slate-400">{category.type} ›</span>
          </Card>
        </Link>
      ))}
      <Link className="text-accent" to="/settings/categories/new">+ Add</Link>
    </div>
  )
}
