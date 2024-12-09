'use client'

import MainLayout from '@/app/layouts/MainLayout'
import Feed from "@/components/layout/Feed"
import RightSidebar from "@/components/layout/RightSidebar"
import SearchResults from '@/components/features/search/SearchResults'
import { useState } from 'react'

export default function Home() {
  const [searchResults, setSearchResults] = useState<{
    relationId: number;
    username: string;
    avatar: string;
  }[]>([])
  const [isSearching, setIsSearching] = useState(false)

  return (
    <MainLayout>
      <div className="flex gap-4 pt-4 px-4">
        <div className="flex-1 min-w-0 space-y-4">
          {/* 搜索结果 */}
          <SearchResults 
            results={searchResults} 
            isSearching={isSearching}
          />
          {/* 原有的Feed组件 */}
          {!isSearching && <Feed />}
        </div>
        <RightSidebar />
      </div>
    </MainLayout>
  )
}
