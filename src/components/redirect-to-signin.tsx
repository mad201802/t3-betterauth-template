'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RedirectToSignIn() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    router.push(`${APP_CONFIG.routes.signIn}?redirect=` + encodeURIComponent(pathname))
  }, [pathname, router])

  return null
}
