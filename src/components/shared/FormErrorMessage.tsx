interface FormErrorMessageProps {
  error: string | null
}

export function FormErrorMessage({ error }: FormErrorMessageProps) {
  if (!error) {
    return null
  }
  return <p className="text-sm text-danger">{error}</p>
}
