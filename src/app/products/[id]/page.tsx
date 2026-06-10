import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { AddToCart } from "@/components/AddToCart"
import Link from "next/link"

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="bg-white p-4 sm:p-6 md:p-10 rounded-xl shadow-sm border">
      <Link href="/products" className="text-blue-600 hover:underline mb-4 sm:mb-6 inline-block text-sm sm:text-base">
        &larr; Kembali ke Daftar Produk
      </Link>
      
      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        {/* Container gambar: fixed square, gambar tidak bisa overflow */}
        <div className="relative w-full aspect-square bg-gray-50 rounded-lg border overflow-hidden">
          <img
            src={product.image_url || "https://placehold.co/600x600?text=No+Image"}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply p-4 sm:p-6"
          />
        </div>

        <div className="flex flex-col justify-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          
          <div className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">Deskripsi:</h3>
            {product.description || "Tidak ada deskripsi tersedia untuk produk ini."}
          </div>

          <AddToCart productId={product.id} stock={product.stock} />
        </div>
      </div>
    </div>
  )
}