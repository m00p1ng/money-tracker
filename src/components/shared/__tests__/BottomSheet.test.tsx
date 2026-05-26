import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { BottomSheet } from '@/components/shared/BottomSheet'

describe('BottomSheet', () => {
  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn()

    render(
      <BottomSheet isOpen={true} onClose={onClose} title="Actions">
        <button type="button">Keep open</button>
      </BottomSheet>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close bottom sheet' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
