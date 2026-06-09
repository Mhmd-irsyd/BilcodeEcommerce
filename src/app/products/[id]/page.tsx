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
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border">
      <Link href="/products" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Kembali ke Daftar Produk
      </Link>
      
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-gray-50 rounded-lg p-6 flex justify-center items-center aspect-square border">
          <img
            src={product.image_url || "https://placehold.co/600x600?text=No+Image"}
            alt={product.name}
            className="max-h-full object-contain mix-blend-multiply"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-2xl font-bold text-blue-600 mb-6">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
          
          <div className="prose prose-sm text-gray-700 mb-4 whitespace-pre-wrap">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Deskripsi:</h3>
            {product.description || "Tidak ada deskripsi tersedia untuk produk ini."}
          </div>

          <AddToCart productId={product.id} stock={product.stock} />
        </div>
      </div>
    </div>
  )
}
