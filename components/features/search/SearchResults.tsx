'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSearchContext } from '@/contexts/SearchContext'
import { useAuth } from '@/contexts/AuthContext'

export default function SearchResults() {
  const { searchResults, isSearching } = useSearchContext()
  const { user } = useAuth()

  if (!isSearching) return null
  
  const filteredResults = searchResults.filter(result => result.relationId !== user?.userId)
  
  if (filteredResults.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 text-center text-gray-500">
          未搜索到相关用户
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="font-bold">搜索结果</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {filteredResults.map((user) => (
          <div key={user.relationId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <Link
              href={`/relation/profile?relationId=${user.relationId}`}
              className="flex items-center gap-3 flex-1"
            >
              <Image
                src={user.avatar}
                alt={user.username}
                width={64}
                height={64}
                className="rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium">{user.username}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
} 