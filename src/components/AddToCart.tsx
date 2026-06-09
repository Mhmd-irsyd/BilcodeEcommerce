"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function AddToCart({ productId, stock }: { productId: string, stock: number }) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Check if the item already exists in the cart
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
      await supabase
        .from("cart")
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: quantity
        })
    }
    
    setLoading(false)
    router.push("/cart")
  }

  return (
    <div className="flex bg-white rounded-lg p-4 border flex-col gap-4 mt-6">
      <div className="flex items-center gap-4">
        <label className="font-semibold text-gray-700">Jumlah:</label>
        <div className="flex items-center border rounded">
          <button 
            type="button"
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >-</button>
          <input 
            type="number" 
            readOnly
            className="w-12 text-center py-1 outline-none text-gray-800" 
            value={quantity} 
          />
          <button 
            type="button"
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600"
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
          >+</button>
        </div>
        <span className="text-sm text-gray-500">Tersisa: {stock}</span>
      </div>

      <button 
        onClick={handleAdd}
        disabled={loading || stock === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Menambahkan..." : stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
      </button>
    </div>
  )
}
