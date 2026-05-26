import { useMemo } from 'react'

const COLOR_TOKENS = [
  { name: 'accent', variable: '--accent' },
  { name: 'accent-light', variable: '--accent-light' },
  { name: 'bg', variable: '--bg' },
  { name: 'income', variable: '--income' },
  { name: 'income-text', variable: '--income-text' },
  { name: 'expense', variable: '--expense' },
  { name: 'expense-text', variable: '--expense-text' },
  { name: 'danger', variable: '--danger' },
  { name: 'accent-btn-1', variable: '--accent-btn-1' },
  { name: 'accent-btn-2', variable: '--accent-btn-2' },
  { name: 'nav-border', variable: '--nav-border' },
  { name: 'bg-glow-1', variable: '--bg-glow-1' },
  { name: 'bg-glow-2', variable: '--bg-glow-2' },
  { name: 'bg-glow-3', variable: '--bg-glow-3' },
]

const TYPE_SCALE = [
  { label: 'text-xs (12px)', className: 'text-xs' },
  { label: 'text-sm (14px)', className: 'text-sm' },
  { label: 'text-base (16px)', className: 'text-base' },
  { label: 'text-lg (18px)', className: 'text-lg' },
  { label: 'text-xl (20px)', className: 'text-xl' },
  { label: 'text-2xl (24px)', className: 'text-2xl' },
  { label: 'text-4xl (36px)', className: 'text-4xl' },
]

const SPACING_SCALE = [
  { label: 'p-1 (4px)', size: 4 },
  { label: 'p-2 (8px)', size: 8 },
  { label: 'p-3 (12px)', size: 12 },
  { label: 'p-4 (16px)', size: 16 },
  { label: 'p-6 (24px)', size: 24 },
  { label: 'p-8 (32px)', size: 32 },
  { label: 'p-12 (48px)', size: 48 },
]

interface ColorSwatchProps {
  name: string
  variable: string
}

function ColorSwatch({ name, variable }: ColorSwatchProps) {
  const resolved = useMemo(
    () => getComputedStyle(document.documentElement).getPropertyValue(variable).trim(),
    [variable],
  )

  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <div className="h-12" style={{ background: `var(${variable})` }} />
      <div className="bg-white/4 px-3 py-2">
        <p className="text-[11px] font-semibold text-slate-100">{name}</p>
        <p className="text-[10px] text-white/40">{variable}</p>
        <p className="text-[10px] text-white/25">{resolved}</p>
      </div>
    </div>
  )
}

interface SectionHeadingProps {
  id: string
  title: string
  description: string
}

function SectionHeading({
  id,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div
      id={id}
      className="mb-4 scroll-mt-8"
      data-design-section
      data-design-section-label={title}
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-white/40">{description}</p>
    </div>
  )
}

export function TokensSection() {
  return (
    <div className="space-y-12">
      <section>
        <SectionHeading id="colors" title="Colors" description="CSS custom property tokens resolved at runtime" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {COLOR_TOKENS.map((t) => (
            <ColorSwatch key={t.name} name={t.name} variable={t.variable} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          id="typography"
          title="Typography"
          description="Font: Inter — text size scale used in the app"
        />
        <div className="space-y-3 rounded-xl border border-white/8 bg-white/3 p-4">
          {TYPE_SCALE.map(({ label, className }) => (
            <div key={label} className="flex items-baseline gap-4">
              <span className="w-36 shrink-0 text-xs text-white/30">{label}</span>
              <span className={`${className} font-medium`}>The quick brown fox</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading id="spacing" title="Spacing" description="Tailwind spacing values used across the app" />
        <div className="space-y-2 rounded-xl border border-white/8 bg-white/3 p-4">
          {SPACING_SCALE.map(({ label, size }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-xs text-white/30">{label}</span>
              <div className="rounded bg-accent/40" style={{ width: size, height: 24 }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
