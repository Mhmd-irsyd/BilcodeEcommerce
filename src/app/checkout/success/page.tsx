"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// Optional wrapper for Suspense boundary when using useSearchParams in Next.js
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Pesanan Berhasil!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Terima kasih telah berbelanja di Bilcode E-Commerce.
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-8 inline-block text-left w-full max-w-sm">
            <p className="text-sm text-gray-500 mb-1 leading-none">Order ID</p>
            <p className="font-mono font-medium text-gray-900 break-all">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Kembali Belanja
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="text-center p-20 animate-pulse">Memuat...</div>}>
        <SuccessContent />
      </Suspense>
    </ProtectedRoute>
  )
}
