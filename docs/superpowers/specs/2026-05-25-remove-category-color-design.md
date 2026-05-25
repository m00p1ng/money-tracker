# Design: Remove Category Color

**Date:** 2026-05-25

## Summary

Remove the `color` field entirely from the `Category` type and all associated UI, seed data, and utility code. Categories will display with their icon only — no color tinting anywhere in the app.

## Changes

### Type (`src/types/domain.ts`)
- Remove `color: string` from the `Category` type

### Seed Data (`src/db/seed.ts`)
- Remove `color` property from all seed category objects

### UI: CategoryFormPage
- Remove `color: '#10b981'` from form default values
- Remove color-based icon preview styling (`hexToRgba(form.color, 0.15)`, `color: form.color`)

### UI: CategorySelectionPage
- Remove `backgroundColor` and `color` tint applied from `category.color` on category grid cells

### Utility Cleanup (`src/lib/color.ts`)
- Check if `hexToRgba` is used anywhere outside of category color. If unused, delete the function and any associated tests.

## Non-Changes

- No DB migration: Dexie ignores extra stored fields not present in the TypeScript type. Existing IndexedDB records may retain the `color` property but it will be harmlessly ignored.
- The `color` field is not indexed in the DB schema, so no index changes are needed.
