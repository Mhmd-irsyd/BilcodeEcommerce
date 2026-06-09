"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const router = useRouter()

  const fetchCartItems = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("cart")
      .select(`
        id, quantity,
        products:product_id ( id, name, price, image_url, stock )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (data) {
      setCartItems(data)
      const sum = data.reduce((acc, item) => acc + (item.products.price * item.quantity), 0)
      setTotal(sum)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  const handleUpdateQuantity = async (cartId: string, currentQuantity: number, action: "increase" | "decrease", stock: number) => {
    const newQuantity = action === "increase" ? Math.min(stock, currentQuantity + 1) : Math.max(1, currentQuantity - 1)
    
    if (newQuantity !== currentQuantity) {
      // Optimistic update UI
      setCartItems(prev => prev.map(item => item.id === cartId ? { ...item, quantity: newQuantity } : item))
      setTotal(prev => {
        const item = cartItems.find(i => i.id === cartId)
        const diff = (newQuantity - currentQuantity) * item.products.price
        return prev + diff
      })

      // Update DB
      await supabase.from("cart").update({ quantity: newQuantity }).eq("id", cartId)
    }
  }

  const handleRemove = async (cartId: string) => {
    await supabase.from("cart").delete().eq("id", cartId)
    fetchCartItems() 
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Keranjang Belanja</h1>
        
        {loading ? (
        <div className="flex justify-center py-20"><div className="animate-pulse text-lg">Memuat keranjang...</div></div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white p-16 rounded-xl shadow-sm border text-center">
          <p className="text-gray-500 mb-6 text-lg">Keranjang Anda masih kosong.</p>
          <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm border items-center">
                <img 
                  src={item.products.image_url || "https://placehold.co/100x100?text=Image"} 
                  className="w-24 h-24 object-contain rounded bg-gray-50 border p-1"
                  alt={item.products.name}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{item.products.name}</h3>
                  <p className="text-blue-600 font-bold mb-3">Rp {item.products.price.toLocaleString("id-ID")}</p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="flex items-center border rounded">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, "decrease", item.products.stock)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-200 text-gray-600 border-r"
                      >-</button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, "increase", item.products.stock)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-200 text-gray-600 border-l"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-center h-full sm:items-end">
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="font-bold text-gray-900 text-lg">Rp {(item.products.price * item.quantity).toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border h-fit sticky top-24">
            <h2 className="text-xl font-bold border-b pb-4 mb-6">Ringkasan Belanja</h2>
            <div className="flex justify-between font-bold text-lg mb-8 text-gray-800">
              <span>Total:</span>
              <span className="text-blue-600">Rp {total.toLocaleString("id-ID")}</span>
            </div>
            <button 
               onClick={() => router.push("/checkout")}
               className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-lg font-bold text-lg transition-colors shadow-sm"
            >
              Lanjutkan ke Checkout
            </button>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}
