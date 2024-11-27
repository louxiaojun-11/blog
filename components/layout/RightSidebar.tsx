'use client'

import { TrendingUp } from 'lucide-react'
import Image from 'next/image'

export default function RightSidebar() {
  const trendingTopics = [
    { id: 1, title: '#热门话题1#', views: '1.2亿' },
    { id: 2, title: '#热门话题2#', views: '8900万' },
    { id: 3, title: '#热门话题3#', views: '5600万' },
  ]

  const recommendedUsers = [
    { id: 1, name: '推荐用户1', followers: '100万+' },
    { id: 2, name: '推荐用户2', followers: '50万+' },
    { id: 3, name: '推荐用户3', followers: '30万+' },
  ]

  return (
    <aside className="w-[300px] hidden xl:block space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[#FF8200]" />
          <h2 className="font-bold">热门话题</h2>
        </div>
        <div className="space-y-3">
          {trendingTopics.map((topic) => (
            <div key={topic.id} className="hover:bg-gray-50 p-2 rounded">
              <h3 className="font-medium text-[#0066FF] hover:underline">
                {topic.title}
              </h3>
              <p className="text-sm text-gray-500">热度 {topic.views}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold mb-4">推荐关注</h2>
        <div className="space-y-4">
          {recommendedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Image
                src={`https://picsum.photos/48/48?random=${user.id}`}
                alt={user.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.followers}粉丝</p>
              </div>
              <button className="text-[#FF8200] hover:bg-orange-50 px-4 py-1 rounded-full border border-[#FF8200]">
                关注
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
} 