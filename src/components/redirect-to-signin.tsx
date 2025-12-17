'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RedirectToSignIn() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    router.push('/auth/sign-in?redirect=' + encodeURIComponent(pathname))
  }, [pathname, router])

  return null
}
