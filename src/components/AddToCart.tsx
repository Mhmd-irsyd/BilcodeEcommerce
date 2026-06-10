"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data: existingCartItem } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single()

    if (existingCartItem) {
      await supabase
        .from("cart")
        .update({ quantity: existingCartItem.quantity + quantity })
        .eq("id", existingCartItem.id)
    } else {
      await supabase.from("cart").insert({
        user_id: user.id,
        product_id: productId,
        quantity: quantity,
      })
    }

    setLoading(false)
    router.push("/cart")
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm flex flex-col gap-4 mt-6">
      {/* Quantity selector */}
      <div className="flex items-center justify-between">
        <label className="font-medium text-gray-700 text-sm">Jumlah:</label>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 text-lg font-medium transition-colors"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="w-12 text-center text-sm font-semibold text-gray-900 select-none">
              {quantity}
            </span>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 text-lg font-medium transition-colors"
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              disabled={quantity >= stock}
            >
              +
            </button>
          </div>

          <span className="text-xs text-gray-400 whitespace-nowrap">Sisa: {stock}</span>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={loading || stock === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
      >
        {loading ? "Menambahkan..." : stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
      </button>
    </div>
  )
}