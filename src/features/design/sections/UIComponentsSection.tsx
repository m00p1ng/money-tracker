import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, TextInput, SelectInput } from '@/components/ui/Field'
import { CurrencyPicker } from '@/components/ui/picker/CurrencyPicker'
import { DatePickerSheet } from '@/components/ui/picker/DatePickerSheet'
import { RepeatPicker } from '@/components/ui/picker/RepeatPicker'
import { TypePickerDropdown } from '@/components/ui/picker/TypePickerDropdown'
import { WalletPicker } from '@/components/ui/picker/WalletPicker'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { Currency, Wallet, RepeatConfig } from '@/types/domain'

const STUB_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', isBase: true, rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', isBase: false, rate: 0.92 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', isBase: false, rate: 35.5 },
]

const STUB_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Cash', type: 'payment', currency: 'USD', balance: 500, color: '#22c55e', icon: '💵' },
  { id: 'w2', name: 'Card', type: 'credit_card', currency: 'USD', balance: 2000, creditLimit: 5000, color: '#3b82f6', icon: '💳' },
]

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

  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  const [dateOpen, setDateOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const [repeatOpen, setRepeatOpen] = useState(false)
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>({ preset: 'never' })

  const [walletOpen, setWalletOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState('w1')

  return (
    <div className="space-y-10">
      <h2 className="text-lg font-bold">UI Components</h2>

      <SubSection id="button" title="Button">
        <div className="flex flex-wrap items-start gap-6">
          <div><Button variant="accent">Accent</Button><VariantLabel label="accent" /></div>
          <div><Button variant="ghost">Ghost</Button><VariantLabel label="ghost (default)" /></div>
          <div><Button variant="danger">Danger</Button><VariantLabel label="danger" /></div>
          <div><Button variant="accent" disabled>Disabled</Button><VariantLabel label="disabled" /></div>
          <div className="w-full max-w-xs"><Button variant="accent" fullWidth>Full Width</Button><VariantLabel label="fullWidth" /></div>
        </div>
      </SubSection>

      <SubSection id="card" title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Card>Empty card</Card><VariantLabel label="default (empty)" /></div>
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

      <SubSection id="field" title="Field">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Field label="Text input"><TextInput placeholder="Enter value…" /></Field>
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

      <SubSection id="type-picker" title="TypePickerDropdown">
        <div className="max-w-xs rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <TypePickerDropdown value={pickerType} onChange={setPickerType} />
          <VariantLabel label={`current: ${pickerType}`} />
        </div>
      </SubSection>

      <SubSection id="currency-picker" title="CurrencyPicker">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setCurrencyOpen(true)}>Open CurrencyPicker</Button>
          <VariantLabel label={`selected: ${selectedCurrency}`} />
          <CurrencyPicker
            isOpen={currencyOpen}
            currencies={STUB_CURRENCIES}
            selectedCode={selectedCurrency}
            onSelect={(code) => {
              setSelectedCurrency(code); setCurrencyOpen(false) 
            }}
            onClose={() => setCurrencyOpen(false)}
          />
        </div>
      </SubSection>

      <SubSection id="date-picker" title="DatePickerSheet">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setDateOpen(true)}>Open DatePickerSheet</Button>
          <VariantLabel label={`selected: ${selectedDate.toLocaleDateString()}`} />
          <DatePickerSheet
            isOpen={dateOpen}
            value={selectedDate}
            onChange={(d) => {
              setSelectedDate(d); setDateOpen(false) 
            }}
            onClose={() => setDateOpen(false)}
          />
        </div>
      </SubSection>

      <SubSection id="repeat-picker" title="RepeatPicker">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setRepeatOpen(true)}>Open RepeatPicker</Button>
          <VariantLabel label={`preset: ${repeatConfig.preset}`} />
          <RepeatPicker
            isOpen={repeatOpen}
            value={repeatConfig}
            onConfirm={(config) => {
              setRepeatConfig(config); setRepeatOpen(false) 
            }}
            onClose={() => setRepeatOpen(false)}
          />
        </div>
      </SubSection>

      <SubSection id="wallet-picker" title="WalletPicker">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setWalletOpen(true)}>Open WalletPicker</Button>
          <VariantLabel label={`selected: ${STUB_WALLETS.find((w) => w.id === selectedWallet)?.name ?? 'none'}`} />
          <WalletPicker
            isOpen={walletOpen}
            wallets={STUB_WALLETS}
            selectedId={selectedWallet}
            onSelect={(id) => {
              setSelectedWallet(id); setWalletOpen(false) 
            }}
            onClose={() => setWalletOpen(false)}
          />
        </div>
      </SubSection>
    </div>
  )
}
