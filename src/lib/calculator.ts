export type CalcState = {
  display: string
  expression: string
  result: number
}

const operators = ['+', '-', '×', '÷'] as const
type Operator = (typeof operators)[number]

export function createCalcState(amount = 0): CalcState {
  return {
    display: amount > 0 ? String(amount) : '',
    expression: amount > 0 ? String(amount) : '',
    result: amount,
  }
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
    const display = state.display === '0' ? key : `${state.display}${key}`
    const expression = state.display && state.expression.endsWith(state.display) ? `${state.expression.slice(0, -state.display.length)}${display}` : `${state.expression}${display}`
    return { display, expression, result: Number(display) || 0 }
  }

  if (key === '.') {
    if (state.display.includes('.')) return state
    const display = state.display ? `${state.display}.` : '0.'
    const expression = state.display && state.expression.endsWith(state.display) ? `${state.expression.slice(0, -state.display.length)}${display}` : `${state.expression}${display}`
    return { display, expression, result: Number(display) || 0 }
  }

  if (operators.includes(key as Operator)) {
    if (!state.display) return state
    return { ...state, display: '', expression: `${state.expression} ${key} ` }
  }

  if (key === '=') {
    const rawTokens = tokens(state.expression, state.display)
    const result = evaluate(rawTokens)
    return { display: String(result), expression: rawTokens.join(' '), result }
  }

  if (key === '±') {
    if (!state.display) return state
    const display = state.display.startsWith('-') ? state.display.slice(1) : `-${state.display}`
    const expression = state.display && state.expression.endsWith(state.display) ? `${state.expression.slice(0, -state.display.length)}${display}` : display
    return { display, expression, result: Number(display) || 0 }
  }

  if (key === '⌫') {
    const display = state.display.slice(0, -1)
    const finalDisplay = display === '-' ? '' : display
    const expression = state.display && state.expression.endsWith(state.display) ? `${state.expression.slice(0, -state.display.length)}${finalDisplay}` : finalDisplay
    return { display: finalDisplay, expression, result: Number(finalDisplay) || 0 }
  }

  return state
}
