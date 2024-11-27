'use client'

import Image from 'next/image'
import { Check, X } from 'lucide-react'

export default function FriendRequests() {
  const requests = [
    { id: 1, name: '用户 1', mutualFriends: 3 },
    { id: 2, name: '用户 2', mutualFriends: 5 },
    { id: 3, name: '用户 3', mutualFriends: 2 },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="font-bold mb-4">好友请求</h2>
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="flex gap-3">
            <Image
              src={`https://picsum.photos/48/48?random=${request.id}`}
              alt={request.name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div className="flex-1">
              <h3 className="font-medium">{request.name}</h3>
              <p className="text-sm text-gray-500">{request.mutualFriends} 个共同好友</p>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-[#FF8200] text-white hover:bg-[#ff9933]">
                  <Check className="w-4 h-4" />
                  接受
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">
                  <X className="w-4 h-4" />
                  拒绝
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 