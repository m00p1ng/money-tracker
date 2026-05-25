import React, { useState } from 'react'

import {
  AddRow,
  AnimatedBar,
  BottomSheet,
  Button,
  FormErrorMessage,
  Icon,
  ListGroup,
  ListRow,
  PageHeader,
  SectionLabel,
  SelectorSheet,
  TransactionRow,
  WheelPicker,
} from '@/components'
import type { SelectorOption } from '@/components'
import { Background } from '@/components/Background'
import { IconPicker } from '@/components/shared/picker/IconPicker'

interface SubSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function SubSection({
  id,
  title,
  children,
}: SubSectionProps) {
  return (
    <section id={id} className="scroll-mt-8">
      <h3 className="mb-4 text-base font-semibold text-white/70">{title}</h3>
      {children}
    </section>
  )
}

function VariantLabel({ label }: { label: string }) {
  return <p className="mt-2 text-center text-xs text-white/30">{label}</p>
}

const HOUR_OPTIONS = ['06', '07', '08', '09', '10', '11', '12']
const MINUTE_OPTIONS = ['00', '15', '30', '45']

export function SharedComponentsSection() {
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [iconValue, setIconValue] = useState('fa-utensils')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pickerValue, setPickerValue] = useState<Record<string, string>>({ hour: '08', minute: '00' })
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectorValue, setSelectorValue] = useState<'usd' | 'eur' | 'thb'>('usd')

  const SELECTOR_OPTIONS: SelectorOption<'usd' | 'eur' | 'thb'>[] = [
    {
      label: 'US Dollar', value: 'usd', description: 'USD',
    },
    {
      label: 'Euro', value: 'eur', description: 'EUR',
    },
    {
      label: 'Thai Baht', value: 'thb', description: 'THB',
    },
  ]

  return (
    <div className="space-y-10">
      <h2 className="text-lg font-bold">Shared Components</h2>

      <SubSection id="background" title="Background">
        <div className="rounded-2xl border border-white/6 bg-white/4 px-4 py-3 text-sm text-white/50">
          Fixed full-screen aurora layer — rendered by{' '}
          <code className="text-accent/80">AppShell</code>, visible behind all content.
          <br />
          <span className="mt-1 block text-xs text-white/30">
            5 animated orbs · 6–9s breathe cycle · GPU composited
          </span>
        </div>
        <Background />
      </SubSection>

      <SubSection id="section-label" title="SectionLabel">
        <SectionLabel>Section heading text</SectionLabel>
      </SubSection>

      <SubSection id="form-error-message" title="FormErrorMessage">
        <div className="space-y-2">
          <div>
            <FormErrorMessage error="This field is required" />
            <VariantLabel label="with error" />
          </div>
          <div>
            <FormErrorMessage error={null} />
            <VariantLabel label="no error (renders nothing)" />
          </div>
        </div>
      </SubSection>

      <SubSection id="page-header" title="PageHeader">
        <div className="rounded-2xl border border-white/6 bg-white/4 p-4">
          <PageHeader title="Page Title" onBack={() => { }} />
          <VariantLabel label="default (no rightSlot)" />
        </div>
      </SubSection>

      <SubSection id="animated-bar" title="AnimatedBar">
        <div className="space-y-3">
          <AnimatedBar
            value={3200}
            maxValue={5000}
            colorFrom="#6c47ff"
            colorTo="#a78bfa"
            textColor="#090914"
            currency="USD"
          />
          <VariantLabel label="64% filled" />
          <AnimatedBar
            value={5000}
            maxValue={5000}
            colorFrom="#22c55e"
            colorTo="#86efac"
            textColor="#052e16"
            currency="USD"
          />
          <VariantLabel label="100% filled" />
          <AnimatedBar
            value={0}
            maxValue={5000}
            colorFrom="#6c47ff"
            colorTo="#a78bfa"
            textColor="#090914"
            currency="USD"
          />
          <VariantLabel label="0% filled" />
        </div>
      </SubSection>

      <SubSection id="transaction-row" title="TransactionRow">
        <div className="space-y-2">
          <TransactionRow
            to="#"
            icon="fa-burger"
            primaryLabel="Food & Drinks"
            secondaryLabel="Today, 12:30"
            amount="-$12.50"
            amountColor="text-red-400"
          />
          <TransactionRow
            to="#"
            icon="fa-briefcase"
            primaryLabel="Salary"
            secondaryLabel="Yesterday"
            amount="+$3,200.00"
            amountColor="text-green-400"
          />
        </div>
      </SubSection>

      <SubSection id="list-group" title="ListGroup + ListRow">
        <ListGroup label="General">
          <ListRow
            icon="fa-wallet"
            label="Wallets"
            sub="3 wallets"
            to="#"
          />
          <ListRow
            icon="fa-tag"
            label="Categories"
            to="#"
          />
          <ListRow
            icon="fa-coins"
            label="Currencies"
            trailing={<span className="text-xs text-white/30">USD</span>}
            to="#"
          />
        </ListGroup>
      </SubSection>

      <SubSection id="add-row" title="AddRow">
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
          <AddRow label="Add Category" to="#" />
        </div>
      </SubSection>

      <SubSection id="wheel-picker" title="WheelPicker">
        <div className="max-w-xs">
          <WheelPicker
            columns={[
              {
                name: 'hour', label: 'Hour', options: HOUR_OPTIONS,
              },
              {
                name: 'minute', label: 'Minute', options: MINUTE_OPTIONS,
              },
            ]}
            value={pickerValue}
            onChange={setPickerValue}
          />
        </div>
        <VariantLabel label={`selected: ${pickerValue.hour}:${pickerValue.minute}`} />
      </SubSection>

      <SubSection id="bottom-sheet" title="BottomSheet">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setSheetOpen(true)}>Open BottomSheet</Button>
          <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Example Sheet">
            <div className="px-4 pb-6 space-y-3">
              <p className="text-sm text-white/60">Sheet content goes here.</p>
              <Button variant="accent" fullWidth onClick={() => setSheetOpen(false)}>Confirm</Button>
            </div>
          </BottomSheet>
        </div>
      </SubSection>

      <SubSection id="icon-picker" title="IconPicker">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIconPickerOpen(true)}
            className={[
              'flex min-h-11 w-full items-center gap-2 rounded-lg',
              'border border-white/10 bg-white/5 px-3 text-slate-50 transition-colors',
            ].join(' ')}
          >
            <Icon name={iconValue} />
            <span className="text-sm">{iconValue}</span>
          </button>
          <VariantLabel label={`selected: ${iconValue}`} />
          <IconPicker
            isOpen={iconPickerOpen}
            selectedIcon={iconValue}
            onSelect={setIconValue}
            onClose={() => setIconPickerOpen(false)}
          />
        </div>
      </SubSection>

      <SubSection id="selector-sheet" title="SelectorSheet">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setSelectorOpen(true)}>Open SelectorSheet</Button>
          <VariantLabel label={`selected: ${selectorValue}`} />
          <SelectorSheet
            isOpen={selectorOpen}
            title="Select Currency"
            options={SELECTOR_OPTIONS}
            value={selectorValue}
            onSelect={(value) => {
              setSelectorValue(value); setSelectorOpen(false)
            }}
            onClose={() => setSelectorOpen(false)}
          />
        </div>
      </SubSection>
    </div>
  )
}
