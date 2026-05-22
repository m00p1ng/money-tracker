import { describe, expect, it } from 'vitest'
import { createCalcState, pressCalcKey } from '../calculator'

describe('calculator', () => {
  it('appends digits and decimal points', () => {
    let state = createCalcState()
    state = pressCalcKey(state, '1')
    state = pressCalcKey(state, '2')
    state = pressCalcKey(state, '.')
    state = pressCalcKey(state, '5')
    expect(state.display).toBe('12.5')
    expect(state.result).toBe(12.5)
  })

  it('evaluates expressions with multiplication before addition', () => {
    let state = createCalcState()
    for (const key of ['2', '+', '3', '×', '4', '=']) {
      state = pressCalcKey(state, key)
    }
    expect(state.expression).toBe('2 + 3 × 4')
    expect(state.result).toBe(14)
    expect(state.display).toBe('14')
  })

  it('toggles sign and deletes input', () => {
    let state = createCalcState()
    for (const key of ['9', '±', '⌫']) {
      state = pressCalcKey(state, key)
    }
    expect(state.display).toBe('')
    expect(state.result).toBe(0)
  })

  it('starts fresh after equals', () => {
    let state = createCalcState()
    for (const key of ['2', '+', '3', '=', '7']) {
      state = pressCalcKey(state, key)
    }
    expect(state.display).toBe('7')
    expect(state.result).toBe(7)
  })

  it('repeats result when equals pressed twice', () => {
    let state = createCalcState()
    for (const key of ['2', '+', '3', '=', '=']) {
      state = pressCalcKey(state, key)
    }
    expect(state.display).toBe('5')
    expect(state.result).toBe(5)
  })
})
