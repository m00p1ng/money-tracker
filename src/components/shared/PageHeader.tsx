import { Icon } from '@/components'

type PageHeaderProps = {
  title: React.ReactNode
  onBack: () => void
  rightSlot?: React.ReactNode
}

export function PageHeader({
  title,
  onBack,
  rightSlot,
}: PageHeaderProps) {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center">
      <button
        aria-label="Back"
        onClick={onBack}
        className="flex h-9 w-9 shrink-0 items-center justify-center bg-transparent text-slate-300"
        type="button"
      >
        <Icon name="fa-chevron-left" />
      </button>
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="flex justify-end">{rightSlot}</div>
    </header>
  )
}
