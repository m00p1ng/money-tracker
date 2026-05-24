import React, { useState } from 'react'

import {
  AddRow,
  AnimatedBar,
  BottomSheet,
  Button,
  FormErrorMessage,
  ListGroup,
  ListRow,
  PageHeader,
  PickerColumn,
  SectionDivider,
  SectionLabel,
  SelectorSheet,
  TransactionRow,
} from '@/components'
import type { SelectorOption } from '@/components'

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
  return <p className="mt-2 text-center text-[10px] text-white/30">{label}</p>
}

const HOUR_OPTIONS = ['06', '07', '08', '09', '10', '11', '12']
const MINUTE_OPTIONS = ['00', '15', '30', '45']

export function SharedComponentsSection() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pickerValue, setPickerValue] = useState<Record<string, string>>({ hour: '08', minute: '00' })
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectorValue, setSelectorValue] = useState<'usd' | 'eur' | 'thb'>('usd')

  const SELECTOR_OPTIONS: SelectorOption<'usd' | 'eur' | 'thb'>[] = [
    { label: 'US Dollar', value: 'usd', description: 'USD' },
    { label: 'Euro', value: 'eur', description: 'EUR' },
    { label: 'Thai Baht', value: 'thb', description: 'THB' },
  ]

  return (
    <div className="space-y-10">
      <h2 className="text-lg font-bold">Shared Components</h2>

      <SubSection id="section-label" title="SectionLabel">
        <SectionLabel>Section heading text</SectionLabel>
      </SubSection>

      <SubSection id="section-divider" title="SectionDivider">
        <SectionDivider label="Today" />
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
            textColor="#fff"
            currency="USD"
          />
          <VariantLabel label="64% filled" />
          <AnimatedBar
            value={5000}
            maxValue={5000}
            colorFrom="#22c55e"
            colorTo="#86efac"
            textColor="#fff"
            currency="USD"
          />
          <VariantLabel label="100% filled" />
          <AnimatedBar
            value={0}
            maxValue={5000}
            colorFrom="#6c47ff"
            colorTo="#a78bfa"
            textColor="#fff"
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
            iconBg="rgba(239,68,68,0.15)"
            iconColor="#ef4444"
            primaryLabel="Food & Drinks"
            secondaryLabel="Today, 12:30"
            amount="-$12.50"
            amountColor="text-red-400"
          />
          <TransactionRow
            to="#"
            icon="fa-briefcase"
            iconBg="rgba(34,197,94,0.15)"
            iconColor="#22c55e"
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
            iconBg="rgba(108,71,255,0.15)"
            iconColor="#6c47ff"
            label="Wallets"
            sub="3 wallets"
            to="#"
          />
          <ListRow
            icon="fa-tag"
            iconBg="rgba(234,179,8,0.15)"
            iconColor="#eab308"
            label="Categories"
            to="#"
          />
          <ListRow
            icon="fa-coins"
            iconBg="rgba(34,197,94,0.15)"
            iconColor="#22c55e"
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

      <SubSection id="picker-column" title="PickerColumn">
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          <PickerColumn
            label="Hour"
            name="hour"
            options={HOUR_OPTIONS}
            value={pickerValue}
            onChange={setPickerValue}
          />
          <PickerColumn
            label="Minute"
            name="minute"
            options={MINUTE_OPTIONS}
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

      <SubSection id="selector-sheet" title="SelectorSheet">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setSelectorOpen(true)}>Open SelectorSheet</Button>
          <VariantLabel label={`selected: ${selectorValue}`} />
          <SelectorSheet
            isOpen={selectorOpen}
            title="Select Currency"
            options={SELECTOR_OPTIONS}
            value={selectorValue}
            onSelect={(value) => { setSelectorValue(value); setSelectorOpen(false) }}
            onClose={() => setSelectorOpen(false)}
          />
        </div>
      </SubSection>
    </div>
  )
}
