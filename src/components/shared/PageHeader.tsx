import { Icon } from '@/components'

type PageHeaderProps = {
  title: string
  onBack: () => void
  rightSlot?: React.ReactNode
}

export function PageHeader({
  title,
  onBack,
  rightSlot,
}: PageHeaderProps) {
  return (
    <header className="relative flex items-center">
      <button
        aria-label="Back"
        onClick={onBack}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-300"
        type="button"
      >
        <Icon name="fa-chevron-left" />
      </button>
      <h1 className="pointer-events-none absolute inset-x-0 text-center text-lg font-bold">{title}</h1>
      {rightSlot && <div className="ml-auto">{rightSlot}</div>}
    </header>
  )
}
