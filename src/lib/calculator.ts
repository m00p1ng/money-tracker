export type CalcState = {
  display: string
  expression: string
  result: number
  lastKey: string | null
}

const operators = ['+', '-', '×', '÷'] as const
type Operator = (typeof operators)[number]

export function createCalcState(amount = 0): CalcState {
  return {
    display: amount > 0 ? String(amount) : '',
    expression: amount > 0 ? String(amount) : '',
    result: amount,
    lastKey: null,
  }
}

function updateExpression(expression: string, oldDisplay: string, newDisplay: string): string {
  return oldDisplay && expression.endsWith(oldDisplay) ? `${expression.slice(0, -oldDisplay.length)}${newDisplay}` : `${expression}${newDisplay}`
}

function tokens(expression: string, display: string): string[] {
  const combined = expression.endsWith(display) ? expression : [expression, display].filter(Boolean).join(' ')
  return combined.trim().split(/\s+/).filter(Boolean)
}

function evaluate(rawTokens: string[]): number {
  const working = [...rawTokens]
  for (const operator of ['×', '÷'] as Operator[]) {
    let index = working.indexOf(operator)
    while (index !== -1) {
      const left = Number(working[index - 1])
      const right = Number(working[index + 1])
      const value = operator === '×' ? left * right : left / right
      working.splice(index - 1, 3, String(value))
      index = working.indexOf(operator)
    }
  }
  let total = Number(working[0] ?? 0)
  for (let index = 1; index < working.length; index += 2) {
    const operator = working[index] as Operator
    const right = Number(working[index + 1])
    total = operator === '+' ? total + right : total - right
  }
  return Number.isFinite(total) ? total : 0
}

export function pressCalcKey(state: CalcState, key: string): CalcState {
  if (/^\d$/.test(key)) {
    if (state.lastKey === '=') {
      return { display: key, expression: key, result: Number(key), lastKey: key }
    }
    const display = state.display === '0' ? key : `${state.display}${key}`
    const expression = updateExpression(state.expression, state.display, display)
    return { display, expression, result: Number(display) || 0, lastKey: key }
  }

  if (key === '.') {
    if (state.display.includes('.')) {
      return state
    }
    if (state.lastKey === '=') {
      return { display: '0.', expression: '0.', result: 0, lastKey: key }
    }
    const display = state.display ? `${state.display}.` : '0.'
    const expression = updateExpression(state.expression, state.display, display)
    return { display, expression, result: Number(display) || 0, lastKey: key }
  }

  if (operators.includes(key as Operator)) {
    if (!state.display) {
      return state
    }
    return { ...state, display: '', expression: `${state.expression} ${key} `, lastKey: key }
  }

  if (key === '=') {
    if (state.lastKey === '=') {
      return { ...state, lastKey: key }
    }
    const rawTokens = tokens(state.expression, state.display)
    const result = evaluate(rawTokens)
    return { display: String(result), expression: rawTokens.join(' '), result, lastKey: key }
  }

  if (key === '±') {
    if (!state.display) {
      return state
    }
    const display = state.display.startsWith('-') ? state.display.slice(1) : `-${state.display}`
    const expression = updateExpression(state.expression, state.display, display)
    return { display, expression, result: Number(display) || 0, lastKey: key }
  }

  if (key === '⌫') {
    const display = state.display.slice(0, -1)
    const finalDisplay = display === '-' ? '' : display
    const expression = updateExpression(state.expression, state.display, finalDisplay)
    return { display: finalDisplay, expression, result: Number(finalDisplay) || 0, lastKey: key }
  }

  return { ...state, lastKey: key }
}
