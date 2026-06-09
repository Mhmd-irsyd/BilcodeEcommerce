export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
  created_at: string
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  products: Product
}

export type Order = {
  id: string
  user_id: string
  total_price: number
  name: string
  address: string
  phone: string
  status: string
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
}
