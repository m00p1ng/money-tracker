import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        'app-bg': 'var(--bg)',
        income: 'var(--income)',
        'income-text': 'var(--income-text)',
        expense: 'var(--expense)',
        'expense-text': 'var(--expense-text)',
        danger: 'var(--danger)',
      },
    },
  },
} satisfies Config
