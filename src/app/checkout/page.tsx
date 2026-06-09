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
    return Array.isArray(item.products)
      ? item.products[0] ?? null
      : item.products
  }

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((acc, item) => {
      const product = getProduct(item)
      return acc + (product?.price ?? 0) * item.quantity
    }, 0)
  }

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setName(user.user_metadata?.full_name || "")

      const { data } = await supabase
        .from("cart")
        .select(`
          id,
          quantity,
          product_id,
          products:product_id (
            name,
            price
          )
        `)
        .eq("user_id", user.id)

      if (!data || data.length === 0) {
        router.push("/cart")
        return
      }

      const normalized: CartItem[] = data.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        product_id: item.product_id,
        products: Array.isArray(item.products)
          ? item.products[0] ?? null
          : item.products ?? null,
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_price: total,
          name,
          phone,
          address,
          status: "success",
        })
        .select()
        .single()

      if (orderError) throw orderError

      const itemsToInsert = cartItems.map((item) => {
        const product = getProduct(item)

        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: product?.price ?? 0,
        }
      })

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      await supabase.from("cart").delete().eq("user_id", user.id)

      router.push(`/checkout/success?order_id=${order.id}`)
    } catch (err) {
      console.error(err)
      alert("Gagal checkout")
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse">
        Menyiapkan checkout...
      </div>
    )

  return (
    <ProtectedRoute>
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* FORM */}
        <div className="bg-white p-6 rounded-xl border">
          <form id="checkout-form" onSubmit={handleCheckout}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama"
              className="w-full border p-2 mb-3"
              required
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="No HP"
              className="w-full border p-2 mb-3"
              required
            />

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat"
              className="w-full border p-2 mb-3"
              required
            />
          </form>
        </div>

        {/* SUMMARY */}
        <div className="bg-gray-50 p-6 rounded-xl border">
          <h2 className="font-bold mb-4">Ringkasan</h2>

          <div className="space-y-3">
            {cartItems.map((item) => {
              const product = getProduct(item)
              if (!product) return null

              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p>{product.name}</p>
                    <p className="text-gray-500">
                      {item.quantity} x Rp{" "}
                      {product.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <p>
                    Rp {(product.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="border-t mt-4 pt-4 font-bold flex justify-between">
            <span>Total</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>

          <button
            form="checkout-form"
            disabled={submitting}
            className="w-full mt-5 bg-blue-600 text-white py-3"
          >
            {submitting ? "Processing..." : "Bayar"}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}