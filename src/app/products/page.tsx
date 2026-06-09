import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/ProductCard"
import SearchInput from "@/components/SearchInput"
import { Product } from "@/types"

export const revalidate = 0 // Opt out of caching for now to show latest products

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
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Daftar Produk</h1>
        
        <div className="w-full md:w-auto">
          <SearchInput initialSearch={search} />
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">Tidak ada produk yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
