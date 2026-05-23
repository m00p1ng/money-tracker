import { Link } from 'react-router'

import { PageHeader, Card } from '@/components'
import type { Category } from '@/types/domain'

interface CategoriesPageProps {
  rootCategories: Category[]
  onBack: () => void
}

export function CategoriesPage({ rootCategories, onBack }: CategoriesPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader title="Categories" onBack={onBack} />
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
