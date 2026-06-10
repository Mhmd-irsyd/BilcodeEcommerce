"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useRouter } from "next/navigation"

type Product = {
  name: string
  price: number
}

type CartItem = {
  id: string
  quantity: number
  product_id: string
  products: Product | Product[] | null
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  const router = useRouter()

  const getProduct = (item: CartItem): Product | null => {
    if (!item.products) return null
    return Array.isArray(item.products) ? item.products[0] ?? null : item.products
  }

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((acc, item) => {
      const product = getProduct(item)
      return acc + (product?.price ?? 0) * item.quantity
    }, 0)
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setName(user.user_metadata?.full_name || "")

      const { data } = await supabase
        .from("cart")
        .select(`id, quantity, product_id, products:product_id (name, price)`)
        .eq("user_id", user.id)

      if (!data || data.length === 0) {
        router.push("/cart")
        return
      }

      const normalized: CartItem[] = data.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        product_id: item.product_id,
        products: Array.isArray(item.products) ? item.products[0] ?? null : item.products ?? null,
      }))

      setCartItems(normalized)
      setTotal(calculateTotal(normalized))
      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({ user_id: user.id, total_price: total, name, phone, address, status: "success" })
        .select()
        .single()

      if (orderError) throw orderError

      const itemsToInsert = cartItems.map((item) => {
        const product = getProduct(item)
        return { order_id: order.id, product_id: item.product_id, quantity: item.quantity, price: product?.price ?? 0 }
      })

      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert)
      if (itemsError) throw itemsError

      await supabase.from("cart").delete().eq("user_id", user.id)
      router.push(`/checkout/success?order_id=${order.id}`)
    } catch (err) {
      console.error(err)
      alert("Gagal checkout, coba lagi.")
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-lg">Menyiapkan checkout...</div>
      </div>
    )

  return (
    <ProtectedRoute>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
        {/* FORM */}
        <div className="bg-white p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-5 pb-4 border-b text-gray-800">Informasi Pengiriman</h2>
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama penerima"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Nama Jalan, No. Rumah, Kota, Kode Pos"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                required
              />
            </div>
          </form>
        </div>

        {/* SUMMARY */}
        <div className="bg-gray-50 p-5 sm:p-8 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-5 pb-4 border-b text-gray-800">Ringkasan Pesanan</h2>

          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const product = getProduct(item)
              if (!product) return null
              return (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1 pr-4">
                    <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {item.quantity} x Rp {product.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 whitespace-nowrap">
                    Rp {(product.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center text-base font-bold text-gray-900">
              <span>Total Pembayaran</span>
              <span className="text-blue-600">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <button
            form="checkout-form"
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3.5 rounded-lg font-bold text-base transition-colors shadow-sm"
          >
            {submitting ? "Memproses..." : "Konfirmasi & Bayar"}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}