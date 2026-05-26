import { DESIGN_GROUPS } from './designRegistry'

export const NAV_GROUPS = DESIGN_GROUPS.map(({
  slug,
  label,
  items,
}) => ({
  slug,
  label,
  items,
}))
