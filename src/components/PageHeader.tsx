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
            className={[
              'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center',
              'rounded-xl text-slate-300',
              'transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
              'active:bg-white/5',
            ].join(' ')}
            type="button"
          >
            <Icon name="fa-chevron-left" />
          </button>
        )
        : (
          leftSlot ?? <div />
        )}
      <h1 className="text-lg font-bold tracking-tight">{title}</h1>
      <div className="flex justify-end">{rightSlot}</div>
    </header>
  )
}
