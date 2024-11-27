'use client'

import Image from 'next/image'
import { UserPlus } from 'lucide-react'

export default function FollowSuggestions() {
  const suggestions = [
    { id: 1, name: '推荐用户 1', bio: '用户简介...', followers: '23.5k' },
    { id: 2, name: '推荐用户 2', bio: '用户简介...', followers: '12.8k' },
    { id: 3, name: '推荐用户 3', bio: '用户简介...', followers: '45.2k' },
  ]

  return (
    <aside className="w-[300px] hidden xl:block">
      <div className="bg-white rounded-lg shadow p-4 sticky top-20">
        <h2 className="font-bold mb-4">推荐关注</h2>
        <div className="space-y-4">
          {suggestions.map((user) => (
            <div key={user.id} className="flex gap-3">
              <Image
                src={`https://picsum.photos/48/48?random=${user.id}`}
                alt={user.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{user.name}</h3>
                <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                <p className="text-xs text-gray-400">{user.followers} 关注者</p>
              </div>
              <button className="text-[#FF8200] hover:bg-orange-50 p-2 rounded-full">
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
} 