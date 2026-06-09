"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login")
      } else {
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return <div className="p-20 text-center min-h-[50vh] flex items-center justify-center">Memeriksa otentikasi...</div>
  }

  return <>{children}</>
}
