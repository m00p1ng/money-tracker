import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { Card } from '../../components/ui/Card'
import { useCategoryStore } from '../../stores/categoryStore'
import { useBackNavigate } from '../../context/navigationDirection'

export function CategoriesPage() {
  const categories = useCategoryStore((state) => state.items)
  const rootCategories = categories.filter((category) => !category.parentId)
  const backNavigate = useBackNavigate()

  return (
    <div className="space-y-5">
      <header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
        <button
          aria-label="Back"
          onClick={() => backNavigate('/settings')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300"
          type="button"
        >
          <Icon name="fa-chevron-left" />
        </button>
        <h1 className="text-center text-base font-bold">Categories</h1>
        <div />
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
