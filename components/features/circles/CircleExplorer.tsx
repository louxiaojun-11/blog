'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

const categories = [
  '全部', '动漫', '阅读', '影视', '科技', '军事', 
  '时事', '生活', '旅游', '音乐', '美食', '学习', '汽车'
]

export default function CircleExplorer() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div>
      {/* 搜索框 */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索圈子..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* 分类列表 */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full ${
              activeCategory === category
                ? 'bg-[#FF8200] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 圈子列表占位 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
            <h3 className="font-bold mb-2">示例圈子 {i}</h3>
            <p className="text-gray-600 text-sm mb-4">这是一个示例圈子的描述...</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">1000 成员</span>
              <button className="px-4 py-1 bg-[#FF8200] text-white rounded-full hover:bg-[#ff9933]">
                加入
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 