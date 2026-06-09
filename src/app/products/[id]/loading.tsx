export default function Loading() {
  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm border animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
      
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-gray-100 rounded-lg aspect-square border"></div>

        <div className="flex flex-col justify-center">
          <div className="h-10 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-8"></div>
          
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
          </div>

          <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
