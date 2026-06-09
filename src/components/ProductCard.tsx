import Link from "next/link"
import Image from "next/image"
import { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden flex flex-col pt-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full">
        {/* Usign standard img tag for simplicity with external urls or use placeholder if missing */}
        <img
          src={product.image_url || "https://placehold.co/400x300?text=No+Image"}
          alt={product.name}
          className="object-contain h-full w-full"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
        <p className="text-xl font-bold text-blue-600 mt-2">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
        <p className="text-sm text-gray-500 mt-1 mb-4">Stock: {product.stock}</p>
        
        <div className="mt-auto">
          <Link
            href={`/products/${product.id}`}
            className="block text-center w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] text-gray-800 font-medium py-2 rounded transition-all duration-200"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  )
}
