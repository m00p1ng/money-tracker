import { CalculatorKeyboard } from './CalculatorKeyboard'

interface CalculatorKeyboardContainerProps {
  onPress: (key: string) => void
  onDismiss?: () => void
}

export function CalculatorKeyboardContainer({ onPress, onDismiss }: CalculatorKeyboardContainerProps) {
  return <CalculatorKeyboard onPress={onPress} onDismiss={onDismiss} />
}
