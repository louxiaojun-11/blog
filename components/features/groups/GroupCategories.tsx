'use client'

import { Hash, Flame, Users, Star } from 'lucide-react'

export default function GroupCategories() {
  const categories = [
    { icon: Hash, label: '全部分类', count: 2451 },
    { icon: Flame, label: '热门小组', count: 328 },
    { icon: Users, label: '我的小组', count: 12 },
    { icon: Star, label: '特别关注', count: 5 },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="font-bold mb-4">小组分类</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map(({ icon: Icon, label, count }) => (
          <button
            key={label}
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50"
          >
            <Icon className="h-6 w-6 text-[#FF8200] mb-2" />
            <span className="font-medium">{label}</span>
            <span className="text-sm text-gray-500">{count}</span>
          </button>
        ))}
      </div>
    </div>
  )
} 