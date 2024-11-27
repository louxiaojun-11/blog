'use client'

import Image from 'next/image'
import { TrendingUp } from 'lucide-react'

export default function GroupDiscovery() {
  const recommendedGroups = [
    { id: 1, name: '旅行摄影', members: '2.3万', activity: '活跃' },
    { id: 2, name: '美食分享', members: '1.8万', activity: '较活跃' },
    { id: 3, name: '电影讨论', members: '1.5万', activity: '活跃' },
    { id: 4, name: '音乐分享', members: '1.2万', activity: '较活跃' },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[#FF8200]" />
          <h2 className="font-bold">推荐小组</h2>
        </div>
        <div className="space-y-4">
          {recommendedGroups.map((group) => (
            <div key={group.id} className="flex items-center gap-3">
              <Image
                src={`https://picsum.photos/48/48?random=${group.id}`}
                alt={group.name}
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-medium">{group.name}</h3>
                <p className="text-sm text-gray-500">
                  {group.members} 成员 · {group.activity}
                </p>
              </div>
              <button className="text-[#FF8200] hover:bg-orange-50 px-3 py-1 rounded-full text-sm border border-[#FF8200]">
                加入
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 