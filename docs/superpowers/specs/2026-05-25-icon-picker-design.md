# Icon Picker — Design Spec

**Date:** 2026-05-25  
**Scope:** Add icon picker to CategoryFormPage and WalletFormPage

---

## Overview

Users currently cannot change the icon on a category or wallet. The `icon` field exists in both `Category` and `Wallet` domain types and is stored in the DB, but there is no UI to select it. This spec adds an `IconPicker` bottom-sheet component and wires it into both forms.

---

## 1. Icon Library Expansion

### `src/components/Icon.tsx`

Add ~30 new FontAwesome free-solid imports to cover common category use cases. The additions (on top of the existing ~50 registered icons):

```
faHome, faMugHot, faDumbbell, faMusic, faBaby, faPaw,
faBriefcase, faCartShopping, faHospital, faBus, faTree,
faGamepad, faBook, faMotorcycle, faBurger, faBicycle,
faSeedling, faWifi, faPhone, faCamera, faStar, faMedal,
faDog, faCat, faBolt, faDroplet, faScissors, faHammer,
faShirt, faGlobe
```

All must be imported from `@fortawesome/free-solid-svg-icons` and added to `library.add(...)`.

### `src/lib/iconOptions.ts`

New file exporting a curated list of icon strings safe for category/wallet use (excludes UI-only icons like arrows, chevrons, xmark, bars, etc.):

```ts
export const ICON_OPTIONS: string[] = [
  // Food & Drink
  'fa-utensils', 'fa-mug-hot', 'fa-burger',
  // Transport
  'fa-car', 'fa-bus', 'fa-plane', 'fa-bicycle', 'fa-motorcycle', 'fa-gas-pump',
  // Shopping
  'fa-bag-shopping', 'fa-cart-shopping', 'fa-shirt',
  // Bills & Home
  'fa-file-invoice-dollar', 'fa-home', 'fa-wifi', 'fa-bolt', 'fa-droplet', 'fa-phone',
  // Health & Fitness
  'fa-heart-pulse', 'fa-dumbbell', 'fa-hospital',
  // Entertainment & Hobbies
  'fa-film', 'fa-music', 'fa-gamepad', 'fa-camera', 'fa-palette',
  // Education
  'fa-graduation-cap', 'fa-book',
  // Personal Care & Family
  'fa-spa', 'fa-scissors', 'fa-baby',
  // Nature & Pets
  'fa-tree', 'fa-seedling', 'fa-paw', 'fa-dog', 'fa-cat',
  // Finance & Work
  'fa-money-bill-wave', 'fa-chart-line', 'fa-coins', 'fa-wallet',
  'fa-laptop-code', 'fa-briefcase', 'fa-building-columns',
  // Travel
  'fa-earth-asia', 'fa-globe',
  // Gift & Awards
  'fa-gift', 'fa-star', 'fa-medal',
  // Tools
  'fa-hammer', 'fa-tag',
  // Other
  'fa-circle-plus', 'fa-ellipsis',
]
```

This list is exported from `src/lib/index.ts`.

---

## 2. `IconPicker` Component

### File
`src/components/shared/picker/IconPicker.tsx`

### Props
```ts
interface IconPickerProps {
  isOpen: boolean
  selectedIcon: string
  onSelect: (icon: string) => void
  onClose: () => void
}
```

### Behavior
- Renders a `BottomSheet` with `title="Icon"`
- Body: scrollable div (`max-h-72 overflow-y-auto px-4 pb-4`)
- Grid: `grid grid-cols-6 gap-2`
- Each cell: square button (`h-11 w-11`) with `Icon` centered inside
- Selected state: `border border-(--accent)/30 bg-(--accent)/12 text-(--accent-light)`
- Unselected state: `rounded-xl bg-white/5 text-white/60`
- On select: calls `onSelect(icon)` then `onClose()`

### Export
Added to `src/components/shared/picker/index.ts`.

---

## 3. Form Integration

### `CategoryFormPage`

**New state:** `const [iconPickerOpen, setIconPickerOpen] = useState(false)`

**Live preview row** (add above the fields card, matching WalletFormPage style):
```
[Icon preview circle]  [category name or "New category"]  [type badge]
```
Icon circle uses `form.color` for background (rgba 15%) and foreground color.

**Icon field** (inside the fields card, after "Name"):
- Label: "Icon"
- Trigger: button showing current icon + icon name text
- Opens `IconPicker`

**Color field** — out of scope for this spec; `form.color` stays hardcoded as `#10b981` default for now.

### `WalletFormPage`

**New state:** `const [iconPickerOpen, setIconPickerOpen] = useState(false)`

**Icon field** (add after the Currency field):
- Label: "Icon"  
- Trigger: same button style as Currency trigger (border, bg-white/5)
- Shows current icon + icon string as label
- Opens `IconPicker`

The existing preview row at the top of WalletFormPage already displays the icon live via `form.icon`.

---

## 4. Component Pattern

Both forms follow the existing `currencyPickerOpen` pattern exactly:

```tsx
const [iconPickerOpen, setIconPickerOpen] = useState(false)

// trigger
<button type="button" onClick={() => setIconPickerOpen(true)}>
  <Icon name={form.icon} /> {form.icon}
</button>

// picker
<IconPicker
  isOpen={iconPickerOpen}
  selectedIcon={form.icon}
  onSelect={(icon) => setForm({ ...form, icon })}
  onClose={() => setIconPickerOpen(false)}
/>
```

---

## 5. Design Section (DesignPage)

Per CLAUDE.md: add an `IconPicker` demo to `src/features/design/sections/SharedComponentsSection` using `SubSection` + `VariantLabel` helpers.

---

## 6. Out of Scope

- Color picker for CategoryFormPage (separate feature)
- Search/filter within the icon picker
- Custom icon upload
- Any changes to existing category/wallet data in the DB (icon field already exists)
