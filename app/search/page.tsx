'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MainLayout from '@/app/layouts/MainLayout'
import { userService } from '@/services/api'
import { useSearchContext } from '@/contexts/SearchContext'
import SearchResults from '@/components/features/search/SearchResults'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const searchContent = searchParams.get('content')
  const searchType = searchParams.get('type') as 'blog' | 'user'
  const { setSearchResults, setIsSearching } = useSearchContext()

  useEffect(() => {
    const performSearch = async () => {
      if (!searchContent) return
      
      try {
        setIsSearching(true)
        if (searchType === 'user') {
          const response = await userService.searchUsers(searchContent)
          if (response.success) {
            setSearchResults(response.data)
          }
        } else {
          // TODO: 处理博文搜索
        }
      } catch (error) {
        console.error('搜索失败:', error)
      }
    }

    performSearch()
  }, [searchContent, searchType, setSearchResults, setIsSearching])

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold">
            {searchType === 'user' ? '用户' : '博文'}搜索结果
          </h1>
          <p className="text-gray-500">
            搜索内容: {searchContent}
          </p>
        </div>
        <SearchResults />
      </div>
    </MainLayout>
  )
} 