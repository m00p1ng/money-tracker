// src/features/design/sections/UIComponentsSection.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, TextInput, SelectInput } from '@/components/ui/Field'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { TypePickerDropdown } from '@/components/ui/picker/TypePickerDropdown'

function SubSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h3 className="mb-4 text-base font-semibold text-white/70">{title}</h3>
      {children}
    </section>
  )
}

function VariantLabel({ label }: { label: string }) {
  return <p className="mt-2 text-center text-[10px] text-white/30">{label}</p>
}

export function UIComponentsSection() {
  const [seg2, setSeg2] = useState<'a' | 'b'>('a')
  const [seg3, setSeg3] = useState<'a' | 'b' | 'c'>('a')
  const [pickerType, setPickerType] = useState<'expense' | 'income' | 'transfer'>('expense')

  return (
    <div className="space-y-10">
      <h2 className="text-lg font-bold">UI Components</h2>

      {/* Button */}
      <SubSection id="button" title="Button">
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <Button variant="accent">Accent</Button>
            <VariantLabel label="accent" />
          </div>
          <div>
            <Button variant="ghost">Ghost</Button>
            <VariantLabel label="ghost (default)" />
          </div>
          <div>
            <Button variant="danger">Danger</Button>
            <VariantLabel label="danger" />
          </div>
          <div>
            <Button variant="accent" disabled>Disabled</Button>
            <VariantLabel label="disabled" />
          </div>
          <div className="w-full max-w-xs">
            <Button variant="accent" fullWidth>Full Width</Button>
            <VariantLabel label="fullWidth" />
          </div>
        </div>
      </SubSection>

      {/* Card */}
      <SubSection id="card" title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Card>Empty card</Card>
            <VariantLabel label="default (empty)" />
          </div>
          <div>
            <Card>
              <p className="text-sm font-semibold">Card title</p>
              <p className="mt-1 text-xs text-white/40">Card with rich content — text, spacing, nested elements.</p>
              <Button variant="accent" className="mt-3">Action</Button>
            </Card>
            <VariantLabel label="with content" />
          </div>
        </div>
      </SubSection>

      {/* Field */}
      <SubSection id="field" title="Field">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Field label="Text input">
              <TextInput placeholder="Enter value…" />
            </Field>
            <VariantLabel label="TextInput" />
          </div>
          <div>
            <Field label="Select input">
              <SelectInput>
                <option>Option A</option>
                <option>Option B</option>
              </SelectInput>
            </Field>
            <VariantLabel label="SelectInput" />
          </div>
          <div>
            <Field label="With error" error="This field is required">
              <TextInput placeholder="Enter value…" />
            </Field>
            <VariantLabel label="error state" />
          </div>
        </div>
      </SubSection>

      {/* SegmentedControl */}
      <SubSection id="segmented-control" title="SegmentedControl">
        <div className="max-w-xs space-y-4">
          <div>
            <SegmentedControl
              value={seg2}
              segments={[{ label: 'First', value: 'a' }, { label: 'Second', value: 'b' }]}
              onChange={setSeg2}
            />
            <VariantLabel label="2 segments" />
          </div>
          <div>
            <SegmentedControl
              value={seg3}
              segments={[{ label: 'One', value: 'a' }, { label: 'Two', value: 'b' }, { label: 'Three', value: 'c' }]}
              onChange={setSeg3}
            />
            <VariantLabel label="3 segments" />
          </div>
        </div>
      </SubSection>

      {/* TypePickerDropdown */}
      <SubSection id="type-picker" title="TypePickerDropdown">
        <div className="max-w-xs rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <TypePickerDropdown value={pickerType} onChange={setPickerType} />
          <VariantLabel label={`current: ${pickerType}`} />
        </div>
      </SubSection>
    </div>
  )
}
