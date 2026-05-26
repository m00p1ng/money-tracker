import { Icon } from '@/components'

type PageHeaderProps = {
  title: React.ReactNode
  onBack?: () => void
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
}

export function PageHeader({
  title,
  onBack,
  leftSlot,
  rightSlot,
}: PageHeaderProps) {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center">
      {onBack
        ? (
          <button
            aria-label="Back"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center bg-transparent text-slate-300"
            type="button"
          >
            <Icon name="fa-chevron-left" />
          </button>
        )
        : (
          leftSlot ?? <div />
        )}
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="flex justify-end">{rightSlot}</div>
    </header>
  )
}
