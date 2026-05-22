const keys = ['+', '1', '2', '3', 'THB', '-', '4', '5', '6', '±', '×', '7', '8', '9', '=', '÷', '.', '0', '⌫']

export function CalculatorKeyboard({ onPress }: { onPress: (key: string) => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[430px] grid-cols-5 gap-2">
        {keys.map((key) => {
          const isOperator = ['+', '-', '×', '÷'].includes(key)
          const isAccent = ['±', '=', 'THB'].includes(key)
          const isDelete = key === '⌫'
          return (
            <button
              key={key}
              className={`h-12 rounded-lg text-lg font-semibold ${isDelete ? 'col-span-2 bg-red-500/20 text-red-200' : isOperator ? 'bg-[var(--accent)]/15 text-accent-light' : isAccent ? 'bg-[var(--accent)]/25 text-white disabled:opacity-50' : 'bg-white/8 text-slate-100'}`}
              disabled={key === 'THB'}
              onClick={() => onPress(key)}
              type="button"
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
