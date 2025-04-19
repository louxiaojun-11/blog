'use client'

import { useState } from 'react'
import MainLayout from '@/app/layouts/MainLayout'
import NewsFeed from '@/components/features/news/NewsFeed'
import NewsCategories from '@/components/features/news/NewsCategories'
import TrendingTopics from '@/components/features/news/TrendingTopics'

export default function NewsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 pt-4 px-4">
        <div className="space-y-4">
          <NewsCategories 
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
          <NewsFeed selectedType={selectedType} />
        </div>
        <TrendingTopics />
      </div>
    </MainLayout>
  )
} 