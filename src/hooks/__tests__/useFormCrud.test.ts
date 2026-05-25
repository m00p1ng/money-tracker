import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useFormCrud } from '@/hooks/useFormCrud'

interface WrapperProps {
  children: React.ReactNode
}

const wrapper = ({ children }: WrapperProps) =>
  React.createElement(MemoryRouter, null, children)

type Item = { id: string; name: string }
const item: Item = { id: '1', name: 'Test' }

function makeOptions(overrides: Partial<Parameters<typeof useFormCrud<Item>>[0]> = {}) {
  return {
    existing: undefined as Item | undefined,
    add: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn<(i: Item) => Promise<void>>().mockResolvedValue(undefined),
    navigateTo: '/list',
    validate: () => null as string | null,
    ...overrides,
  }
}

describe('useFormCrud', () => {
  it('calls add when existing is undefined', async () => {
    const opts = makeOptions()
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onSubmit(item)
    })
    expect(opts.add).toHaveBeenCalledWith(item)
    expect(opts.update).not.toHaveBeenCalled()
  })

  it('calls update when existing is defined', async () => {
    const opts = makeOptions({ existing: item })
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onSubmit(item)
    })
    expect(opts.update).toHaveBeenCalledWith(item)
    expect(opts.add).not.toHaveBeenCalled()
  })

  it('sets error when add throws', async () => {
    const opts = makeOptions({ add: vi.fn().mockRejectedValue(new Error('Save failed')) })
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onSubmit(item)
    })
    expect(result.current.error).toBe('Save failed')
  })

  it('calls remove with the full item when existing is defined', async () => {
    const opts = makeOptions({ existing: item })
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onDelete()
    })
    expect(opts.remove).toHaveBeenCalledWith(item)
  })

  it('does nothing on delete when existing is undefined', async () => {
    const opts = makeOptions()
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onDelete()
    })
    expect(opts.remove).not.toHaveBeenCalled()
  })

  it('sets error when validate returns a message', async () => {
    const opts = makeOptions({ validate: () => 'Name is required' })
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onSubmit(item)
    })
    expect(result.current.error).toBe('Name is required')
    expect(opts.add).not.toHaveBeenCalled()
  })
})
