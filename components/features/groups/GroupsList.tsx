'use client'

import Image from 'next/image'
import { Users, MessageSquare } from 'lucide-react'

export default function GroupsList() {
  const groups = [
    { 
      id: 1, 
      name: '摄影爱好者', 
      description: '分享摄影技巧和作品',
      members: 12543,
      posts: 1205,
      cover: 'https://picsum.photos/400/200?random=1'
    },
    { 
      id: 2, 
      name: '美食探店', 
      description: '寻找城市美食，分享美食体验',
      members: 8432,
      posts: 943,
      cover: 'https://picsum.photos/400/200?random=2'
    },
    { 
      id: 3, 
      name: '读书会', 
      description: '共读经典，分享感悟',
      members: 5234,
      posts: 621,
      cover: 'https://picsum.photos/400/200?random=3'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => (
        <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
          <Image
            src={group.cover}
            alt={group.name}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{group.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{group.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group.members.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {group.posts.toLocaleString()}
                </span>
              </div>
              <button className="px-4 py-2 rounded-full bg-[#FF8200] text-white hover:bg-[#ff9933]">
                加入小组
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 