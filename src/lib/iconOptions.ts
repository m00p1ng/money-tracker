export type IconOptionGroup = {
  label: string
  icons: string[]
}

export const ICON_OPTION_GROUPS: IconOptionGroup[] = [
  {
    label: 'Food & Drink',
    icons: [
      'fa-utensils', 'fa-mug-hot', 'fa-burger', 'fa-pizza-slice',
      'fa-ice-cream', 'fa-bread-slice', 'fa-bowl-rice', 'fa-fish',
    ],
  },
  {
    label: 'Transport',
    icons: [
      'fa-car', 'fa-bus', 'fa-plane', 'fa-train', 'fa-train-subway',
      'fa-taxi', 'fa-bicycle', 'fa-motorcycle', 'fa-gas-pump',
      'fa-ship', 'fa-route',
    ],
  },
  {
    label: 'Shopping',
    icons: [
      'fa-bag-shopping', 'fa-cart-shopping', 'fa-basket-shopping',
      'fa-store', 'fa-shirt', 'fa-receipt',
    ],
  },
  {
    label: 'Bills & Home',
    icons: [
      'fa-file-invoice-dollar', 'fa-home', 'fa-wifi', 'fa-bolt',
      'fa-droplet', 'fa-phone', 'fa-mobile-screen', 'fa-couch', 'fa-bed',
    ],
  },
  {
    label: 'Health & Fitness',
    icons: [
      'fa-heart-pulse', 'fa-dumbbell', 'fa-person-running', 'fa-hospital',
      'fa-house-medical', 'fa-shield-heart', 'fa-pills',
    ],
  },
  {
    label: 'Entertainment & Hobbies',
    icons: [
      'fa-film', 'fa-music', 'fa-gamepad', 'fa-camera', 'fa-palette',
      'fa-ticket', 'fa-tv', 'fa-headphones',
    ],
  },
  {
    label: 'Education',
    icons: [
      'fa-graduation-cap', 'fa-book', 'fa-book-open',
      'fa-book-open-reader', 'fa-user-graduate',
    ],
  },
  {
    label: 'Personal Care & Family',
    icons: ['fa-spa', 'fa-scissors', 'fa-baby'],
  },
  {
    label: 'Nature & Pets',
    icons: ['fa-tree', 'fa-seedling', 'fa-paw', 'fa-dog', 'fa-cat'],
  },
  {
    label: 'Finance & Work',
    icons: [
      'fa-money-bill-wave', 'fa-chart-line', 'fa-coins', 'fa-wallet',
      'fa-piggy-bank', 'fa-credit-card', 'fa-sack-dollar',
      'fa-money-bill-transfer', 'fa-landmark', 'fa-laptop-code',
      'fa-briefcase', 'fa-building-columns',
    ],
  },
  {
    label: 'Travel',
    icons: [
      'fa-earth-asia', 'fa-globe', 'fa-plane-departure', 'fa-hotel',
      'fa-location-dot',
    ],
  },
  {
    label: 'Gift & Awards',
    icons: ['fa-gift', 'fa-star', 'fa-medal'],
  },
  {
    label: 'Tools',
    icons: ['fa-hammer', 'fa-tag'],
  },
  {
    label: 'Other',
    icons: ['fa-circle-plus', 'fa-ellipsis'],
  },
]

export const ICON_OPTIONS: string[] = ICON_OPTION_GROUPS.flatMap((group) => group.icons)
