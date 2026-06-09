"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function SearchInput({ initialSearch }: { initialSearch: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialSearch)

  useEffect(() => {
    // Memberikan delay ketika mengetik sebelum nge-hit URL (Debounce)
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set("search", searchTerm)
      } else {
        params.delete("search")
      }
      
      // Mengubah URL secara real-time yang akan mentrigger server component mencari data baru
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, 400) // Delay 400 milidetik

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, pathname, router, searchParams])

  return (
    <div className="flex shadow-sm rounded-md w-full relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Ketik untuk mencari produk..."
        className="pl-10 pr-4 py-2.5 border border-gray-300 text-gray-900 bg-white rounded-md w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
      />
    </div>
  )
}
