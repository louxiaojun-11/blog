'use client'

import { Search } from 'lucide-react'

export default function FriendSearch() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="relative">
        <input
          type="search"
          placeholder="搜索好友..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      <div className="flex gap-2 mt-4">
        {['全部好友', '最近互动', '特别关注', '分组管理'].map((filter) => (
          <button
            key={filter}
            className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
} 