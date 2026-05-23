import { Icon } from '../Icon'

type PageHeaderProps = {
  title: string
  onBack: () => void
  rightSlot?: React.ReactNode
}

export function PageHeader({ title, onBack, rightSlot }: PageHeaderProps) {
  return (
    <header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
      <button
        aria-label="Back"
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300"
        type="button"
      >
        <Icon name="fa-chevron-left" />
      </button>
      <h1 className="text-center text-base font-bold">{title}</h1>
      {rightSlot ?? <div />}
    </header>
  )
}
