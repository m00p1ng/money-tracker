export function FormErrorMessage({ error }: { error: string | null }) {
  if (!error) return null
  return <p className="text-sm text-red-300">{error}</p>
}
