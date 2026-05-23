// src/features/design/sections/TokensSection.tsx
import { useEffect, useState } from 'react'

const COLOR_TOKENS = [
  { name: 'accent', variable: '--accent' },
  { name: 'accent-light', variable: '--accent-light' },
  { name: 'bg', variable: '--bg' },
  { name: 'income', variable: '--income' },
  { name: 'expense', variable: '--expense' },
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

function ColorSwatch({ name, variable }: { name: string; variable: string }) {
  const [resolved, setResolved] = useState('')
  useEffect(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
    setResolved(value)
  }, [variable])

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08]">
      <div className="h-12" style={{ background: `var(${variable})` }} />
      <div className="bg-white/[0.04] px-3 py-2">
        <p className="text-[11px] font-semibold text-slate-100">{name}</p>
        <p className="text-[10px] text-white/40">{variable}</p>
        <p className="text-[10px] text-white/25">{resolved}</p>
      </div>
    </div>
  )
}

function SectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div id={id} className="mb-4 scroll-mt-8">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-white/40">{description}</p>
    </div>
  )
}

export function TokensSection() {
  return (
    <div className="space-y-12">
      {/* Colors */}
      <section>
        <SectionHeading id="colors" title="Colors" description="CSS custom property tokens resolved at runtime" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {COLOR_TOKENS.map((t) => (
            <ColorSwatch key={t.name} name={t.name} variable={t.variable} />
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <SectionHeading id="typography" title="Typography" description="Font: Inter — text size scale used in the app" />
        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          {TYPE_SCALE.map(({ label, className }) => (
            <div key={label} className="flex items-baseline gap-4">
              <span className="w-36 flex-shrink-0 text-[10px] text-white/30">{label}</span>
              <span className={`${className} font-medium`}>The quick brown fox</span>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section>
        <SectionHeading id="spacing" title="Spacing" description="Tailwind spacing values used across the app" />
        <div className="space-y-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          {SPACING_SCALE.map(({ label, size }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="w-24 flex-shrink-0 text-[10px] text-white/30">{label}</span>
              <div
                className="rounded bg-accent/40"
                style={{ width: size, height: 16 }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
