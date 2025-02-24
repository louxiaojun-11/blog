'use client'

import { Hash, Flame, Users, Star } from 'lucide-react'

// 添加分类常量
const categories = [
  '全部', '动漫', '阅读', '影视', '科技', '军事', 
  '时事', '生活', '旅游', '音乐', '美食', '学习', '汽车'
]

interface GroupCategoriesProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export default function GroupCategories({ selectedType, onTypeChange }: GroupCategoriesProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="font-bold mb-2">圈子分类</h2>
      <div className="grid grid-cols-6 gap-2">
        {categories.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`flex items-center justify-center px-3 py-1.5 rounded-lg transition-colors text-sm ${
              selectedType === type
                ? 'bg-[#FF8200] text-white'
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  )
} 