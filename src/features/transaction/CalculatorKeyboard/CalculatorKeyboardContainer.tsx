import { CalculatorKeyboard } from './CalculatorKeyboard'

export function CalculatorKeyboardContainer({ onPress, onDismiss }: { onPress: (key: string) => void; onDismiss?: () => void }) {
  return <CalculatorKeyboard onPress={onPress} onDismiss={onDismiss} />
}
