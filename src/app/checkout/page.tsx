"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Checkout Form
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  
  const router = useRouter()

  useEffect(() => {
    const fetchCartAndUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Pre-fill name from metadata if available
      setName(user.user_metadata?.full_name || "")

      const { data } = await supabase
        .from("cart")
        .select(`
          id, quantity, product_id,
          products:product_id ( name, price )
        `)
        .eq("user_id", user.id)

      if (data && data.length > 0) {
        setCartItems(data)
        const sum = data.reduce((acc, item) => acc + (item.products.price * item.quantity), 0)
        setTotal(sum)
      } else {
        router.push("/cart") // Redirect to cart if empty
      }
      setLoading(false)
    }

    fetchCartAndUser()
  }, [router])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_price: total,
          name,
          phone,
          address,
          status: "success" // Simplification: automatically success for this test
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Insert Order Items
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsToInsert)
      if (itemsError) throw itemsError

      // 3. Clear Cart
      const { error: cartError } = await supabase.from("cart").delete().eq("user_id", user.id)
      if (cartError) throw cartError

      // 4. Redirect to Success Page
      router.push(`/checkout/success?order_id=${order.id}`)
      
    } catch (error) {
      console.error("Error during checkout:", error)
      alert("Terjadi kesalahan saat memproses pesanan.")
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse">Menyiapkan checkout...</div>

  return (
    <ProtectedRoute>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
      
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Form Pengiriman */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border h-fit">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Informasi Pengiriman</h2>
          
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Masukkan nama penerima"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
              <textarea
                required
                rows={4}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Kecamatan, Kota, Kode Pos"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Ringkasan Order */}
        <div className="bg-gray-50 p-6 md:p-8 rounded-xl shadow-sm border h-fit">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Ringkasan Pesanan</h2>
          
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-medium text-gray-800 line-clamp-1">{item.products.name}</p>
                  <p className="text-gray-500">{item.quantity} x Rp {item.products.price.toLocaleString("id-ID")}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  Rp {(item.products.price * item.quantity).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mb-8">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>Total Pembayaran</span>
              <span className="text-blue-600">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <button
            form="checkout-form"
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-sm"
          >
            {submitting ? "Memproses..." : "Konfirmasi & Bayar"}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}
