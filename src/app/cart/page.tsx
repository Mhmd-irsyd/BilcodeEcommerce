"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Link from "next/link"
import { useRouter } from "next/navigation"

type CartItem = {
  id: string
  user_id: string
  quantity: number
  product_id: string
  name: string
  price: number
  image_url: string | null
  stock: number
  created_at: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const router = useRouter()

  const calculateTotal = (items: CartItem[]) =>
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const fetchCartItems = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("cart_view")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (error) console.error("Error fetching cart:", error)

    if (data) {
      setCartItems(data as CartItem[])
      setTotal(calculateTotal(data as CartItem[]))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  const handleUpdateQuantity = async (
    cartId: string,
    currentQuantity: number,
    action: "increase" | "decrease",
    stock: number
  ) => {
    const newQuantity =
      action === "increase"
        ? Math.min(stock, currentQuantity + 1)
        : Math.max(1, currentQuantity - 1)

    if (newQuantity === currentQuantity) return

    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.id === cartId ? { ...item, quantity: newQuantity } : item
      )
      setTotal(calculateTotal(updated))
      return updated
    })

    await supabase.from("cart").update({ quantity: newQuantity }).eq("id", cartId)
  }

  const handleRemove = async (cartId: string) => {
    const updated = cartItems.filter((item) => item.id !== cartId)
    setCartItems(updated)
    setTotal(calculateTotal(updated))
    await supabase.from("cart").delete().eq("id", cartId)
  }

  return (
    <ProtectedRoute>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Keranjang Belanja</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse text-gray-500 text-base">Memuat keranjang...</div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white p-10 sm:p-16 rounded-xl shadow-sm border text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-6 text-base">Keranjang Anda masih kosong.</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl shadow-sm border items-start"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg bg-gray-50 border p-1 overflow-hidden">
                  <img
                    src={item.image_url || "https://placehold.co/100x100?text=Image"}
                    className="w-full h-full object-contain"
                    alt={item.name}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-blue-600 font-bold text-sm sm:text-base mt-1">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>

                  {/* Quantity + Hapus */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, "decrease", item.stock)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-base font-medium transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-gray-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, "increase", item.stock)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-base font-medium transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium underline ml-1"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-400">Subtotal</p>
                  <p className="font-bold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary — sticky di desktop, normal di mobile */}
          <div className="bg-white p-5 rounded-xl shadow-sm border h-fit lg:sticky lg:top-24">
            <h2 className="text-base sm:text-lg font-bold border-b pb-3 mb-4 text-gray-900">
              Ringkasan Belanja
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total item</span>
                <span>{cartItems.reduce((a, i) => a + i.quantity, 0)} item</span>
              </div>
              <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t">
                <span>Total:</span>
                <span className="text-blue-600">Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-3 rounded-lg font-bold text-sm sm:text-base transition-colors shadow-sm"
            >
              Lanjutkan ke Checkout
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}