'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import MainLayout from '@/app/layouts/MainLayout'
import BlogList from '@/components/features/blog/BlogList'
import { useAuth } from '@/contexts/AuthContext'

export default function BlogPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentPage = Number(searchParams.get('page')) || 1

  const handlePageChange = (page: number) => {
    // 更新 URL 参数
    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    router.push(url.pathname + url.search)
  }

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <h1 className="text-2xl font-bold mb-6">我的博文</h1>
        <BlogList 
          isPersonal={true} 
          userId={user?.userId} 
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </MainLayout>
  )
} 