'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MainLayout from '@/app/layouts/MainLayout'
import BlogList from '@/components/features/blog/BlogList'
import { blogService } from '@/services/api'
import { BlogPost } from '@/types/api'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  records: BlogPost[];
  total: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const content = searchParams.get('content') || ''
  const type = searchParams.get('type') || 'blog'
  
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<SearchResult>({ records: [], total: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  useEffect(() => {
    if (type === 'blog' && content) {
      searchBlogs(content, currentPage, pageSize)
    }
  }, [content, type, currentPage, pageSize])
  
  const searchBlogs = async (keyword: string, page: number = 1, pageSize: number = 10) => {
    try {
      setLoading(true)
      const response = await blogService.searchBlogs({
        keyword,
        page,
        pageSize
      })
      
      if (response.success) {
        setSearchResults({
          records: response.data.records,
          total: response.data.total
        })
      }
    } catch (error) {
      console.error('搜索博文失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1) // 重置到第一页
  }
  
  // 如果不是博文搜索，显示空页面或重定向
  if (type !== 'blog') {
    return (
      <MainLayout>
        <div className="pt-4 px-4">
          <h1 className="text-2xl font-bold mb-6">搜索结果</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p>正在显示用户搜索结果...</p>
          </div>
        </div>
      </MainLayout>
    )
  }
  
  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <h1 className="text-2xl font-bold mb-6">
          搜索结果: "{content}"
          <span className="text-gray-500 text-lg ml-2">共 {searchResults.total} 条结果</span>
        </h1>
        
        {loading && searchResults.records.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">正在搜索...</p>
          </div>
        ) : searchResults.records.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4 text-gray-400">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-medium mb-2">未找到相关博文</h2>
            <p className="text-gray-500 mb-6">
              没有找到与 "{content}" 相关的博文，请尝试其他关键词
            </p>
            <Link href="/" className="text-[#FF8200] hover:underline">
              返回首页
            </Link>
          </div>
        ) : (
          <BlogList 
            blogList={searchResults.records}
            total={searchResults.total}
            currentPage={currentPage}
            currentPageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </MainLayout>
  )
} 