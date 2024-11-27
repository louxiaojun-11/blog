'use client'

export default function NewsCategories() {
  const categories = [
    '推荐', '科技', '财经', '体育', '娱乐', 
    '教育', '汽车', '时尚', '游戏', '健康'
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 whitespace-nowrap"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
} 