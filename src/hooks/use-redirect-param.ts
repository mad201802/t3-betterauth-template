import { useSearchParams } from 'next/navigation'

export function useRedirectParam(): string {
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect')
  return rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.includes('://') ? rawRedirect : '/dashboard'
}