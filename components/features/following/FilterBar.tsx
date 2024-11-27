'use client'

export default function FilterBar() {
  const filters = ['全部', '用户', '话题', '视频']
  
  return (
    <div className="bg-white rounded-lg shadow mb-4 sticky top-16 z-10">
      <div className="flex gap-8 p-4">
        {filters.map((filter) => (
          <button
            key={filter}
            className="text-gray-600 hover:text-[#FF8200] pb-2 px-2 relative group"
          >
            {filter}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF8200] scale-x-0 group-hover:scale-x-100 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  )
} 