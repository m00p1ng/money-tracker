import React, { useState } from 'react'

import {
  AddRow,
  AnimatedBar,
  BottomSheet,
  Button,
  Card,
  CurrencyPicker,
  DateRangePresetPicker,
  DateTimePicker,
  Field,
  FormActions,
  FormErrorMessage,
  Icon,
  IconPicker,
  ListGroup,
  ListRow,
  PageHeader,
  RepeatPicker,
  SectionLabel,
  SegmentedControl,
  SelectInput,
  SelectorSheet,
  Switch,
  TextAreaInput,
  TextInput,
  TransactionRow,
  TypePickerDropdown,
  WalletPicker,
  WheelPicker,
  type SelectorOption,
} from '@/components'
import { Background } from '@/components/Background'
import type { DateRangePreset } from '@/lib'
import type {
  Currency,
  RepeatConfig,
  TransactionType,
  Wallet,
} from '@/types/domain'

const STUB_CURRENCIES: Currency[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    isBase: true,
    rate: 1,
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    isBase: false,
    rate: 0.92,
  },
  {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    isBase: false,
    rate: 35.5,
  },
]

const STUB_WALLETS: Wallet[] = [
  {
    id: 'w1',
    name: 'Cash',
    type: 'payment',
    currency: 'USD',
    balance: 500,
    color: '#22c55e',
    icon: '💵',
  },
  {
    id: 'w2',
    name: 'Card',
    type: 'credit_card',
    currency: 'USD',
    balance: 2000,
    creditLimit: 5000,
    color: '#3b82f6',
    icon: '💳',
  },
]

const HOUR_OPTIONS = ['06', '07', '08', '09', '10', '11', '12']
const MINUTE_OPTIONS = ['00', '15', '30', '45']

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
    <section
      id={id}
      className="scroll-mt-8"
      data-design-section
      data-design-section-label={title}
    >
      <h3 className="mb-4 text-base font-semibold text-white/70">{title}</h3>
      {children}
    </section>
  )
}

function VariantLabel({ label }: { label: string }) {
  return <p className="mt-2 text-center text-xs text-white/30">{label}</p>
}

function UIComponentDemos() {
  const [selectDemo, setSelectDemo] = useState('a')
  const [seg2, setSeg2] = useState<'a' | 'b'>('a')
  const [seg3, setSeg3] = useState<'a' | 'b' | 'c'>('a')
  const [pickerType, setPickerType] = useState<TransactionType>('expense')

  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  const [dateOpen, setDateOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const [repeatOpen, setRepeatOpen] = useState(false)
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>({ preset: 'never' })

  const [walletOpen, setWalletOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState('w1')

  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangePreset>('this-month')

  const [switchChecked, setSwitchChecked] = useState(false)
  const [switchWithDesc, setSwitchWithDesc] = useState(true)

  return (
    <div className="space-y-10">
      <h2 className="text-lg font-bold">UI Components</h2>

      <SubSection id="button" title="Button">
        <div className="flex flex-wrap items-start gap-6">
          <div><Button variant="accent">Accent</Button><VariantLabel label="accent" /></div>
          <div><Button variant="ghost">Ghost</Button><VariantLabel label="ghost (default)" /></div>
          <div><Button variant="danger">Danger</Button><VariantLabel label="danger" /></div>
          <div><Button variant="accent" disabled>Disabled</Button><VariantLabel label="disabled" /></div>
          <div className="w-full max-w-xs">
            <Button variant="accent" fullWidth>Full Width</Button>
            <VariantLabel label="fullWidth" />
          </div>
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
              <SelectInput
                value={selectDemo}
                options={[
                  { value: 'a', label: 'Option A' },
                  { value: 'b', label: 'Option B' },
                ]}
                onChange={setSelectDemo}
              />
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
        <div className="max-w-xs rounded-xl border border-white/8 bg-white/3 p-4">
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

      <SubSection id="date-time-picker" title="DateTimePicker">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setDateOpen(true)}>Open DatePicker</Button>
          <VariantLabel label={`selected: ${selectedDate.toLocaleDateString()}`} />
          <DateTimePicker
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

      <SubSection id="date-range-preset-picker" title="DateRangePresetPicker">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => setDateRangeOpen(true)}>Open DateRangePresetPicker</Button>
          <VariantLabel label={`selected: ${selectedDateRange}`} />
          <DateRangePresetPicker
            isOpen={dateRangeOpen}
            value={selectedDateRange}
            onSelect={(preset) => {
              setSelectedDateRange(preset)
              setDateRangeOpen(false)
            }}
            onClose={() => setDateRangeOpen(false)}
          />
        </div>
      </SubSection>

      <SubSection id="switch" title="Switch">
        <div className="space-y-4 max-w-sm">
          <div>
            <Switch
              label="Notifications"
              checked={switchChecked}
              onChange={setSwitchChecked}
            />
            <VariantLabel label="without description" />
          </div>
          <div>
            <Switch
              label="Dark mode"
              description="Use dark theme across the app"
              checked={switchWithDesc}
              onChange={setSwitchWithDesc}
            />
            <VariantLabel label="with description" />
          </div>
        </div>
      </SubSection>

      <SubSection id="textarea-input" title="TextAreaInput">
        <div className="max-w-sm">
          <TextAreaInput placeholder="Write a note…" rows={3} />
          <VariantLabel label="default" />
        </div>
      </SubSection>

      <SubSection id="form-actions" title="FormActions">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <FormActions submitLabel="Save" />
            <VariantLabel label="save only" />
          </div>
          <div>
            <FormActions
              submitLabel="Save"
              showDelete
              deleteLabel="Delete"
              onDelete={() => { }}
            />
            <VariantLabel label="with delete" />
          </div>
        </div>
      </SubSection>
    </div>
  )
}

function SharedComponentDemos() {
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [iconValue, setIconValue] = useState('fa-utensils')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pickerValue, setPickerValue] = useState<Record<string, string>>({ hour: '08', minute: '00' })
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectorValue, setSelectorValue] = useState<'usd' | 'eur' | 'thb'>('usd')

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
            title="Food & Drinks"
            date="2026-05-26T12:30:00"
            amount={-12.50}
            currency="USD"
            amountColor="text-red-400"
          />
          <TransactionRow
            to="#"
            icon="fa-briefcase"
            title="Salary"
            date="2026-05-25T12:30:00"
            amount={3200}
            currency="USD"
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

export function ComponentsSection() {
  return (
    <div className="space-y-12">
      <UIComponentDemos />
      <SharedComponentDemos />
    </div>
  )
}
