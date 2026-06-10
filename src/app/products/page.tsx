import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/ProductCard"
import SearchInput from "@/components/SearchInput"
import { Product } from "@/types"

export const revalidate = 0

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams;
  const search = params.search || ""

  let query = supabase.from("products").select("*").order("created_at", { ascending: false })
  
  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data: products, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div className="px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daftar Produk</h1>
        <div className="w-full sm:w-72">
          <SearchInput initialSearch={search} />
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-base">Tidak ada produk yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}