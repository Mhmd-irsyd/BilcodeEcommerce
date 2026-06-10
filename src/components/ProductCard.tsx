"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    setIsClicked(false)
  }, [])

  return (
    <div className="border rounded-xl overflow-hidden flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow">
      
      {/* Gambar: fixed square, no padding, object-contain agar full terlihat */}
      <div className="relative w-full aspect-square bg-white border-b">
        <img
          src={product.image_url || "https://placehold.co/400x400?text=No+Image"}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply p-3 sm:p-4"
        />
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <h3 className="text-xs sm:text-base font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.25rem] sm:min-h-[2.5rem]">
          {product.name}
        </h3>

        <p className="text-sm sm:text-lg font-bold text-blue-600 mt-1.5 sm:mt-2">
          Rp {product.price.toLocaleString("id-ID")}
        </p>

        <p className="text-xs text-gray-400 mt-0.5 mb-2 sm:mb-3">
          Stok: {product.stock}
        </p>

        <div className="mt-auto">
          <Link
            href={`/products/${product.id}`}
            prefetch={true}
            onClick={() => setIsClicked(true)}
            className={`block text-center w-full font-medium py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
              isClicked
                ? "bg-blue-600 text-white cursor-wait opacity-90"
                : "bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-700 border border-blue-200"
            }`}
          >
            {isClicked ? "Memuat..." : "Lihat Detail"}
          </Link>
        </div>
      </div>
    </div>
  )
}