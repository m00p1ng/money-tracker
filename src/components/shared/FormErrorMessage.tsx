export function FormErrorMessage({ error }: { error: string | null }) {
  if (!error) {
    return null
  }
  return <p className="text-sm text-danger">{error}</p>
}
