interface FormErrorMessageProps {
  error: string | null
}

export function FormErrorMessage({ error }: FormErrorMessageProps) {
  if (!error) {
    return null
  }

  return (
    <p className={[
      'flex items-center gap-1.5 rounded-lg border',
      'border-danger/20 bg-danger/8 px-3 py-2 text-sm text-danger',
    ].join(' ')}>
      {error}
    </p>
  )
}
