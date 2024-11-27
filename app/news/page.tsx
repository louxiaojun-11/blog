import NewsFeed from '@/components/features/news/NewsFeed'
import NewsCategories from '@/components/features/news/NewsCategories'
import TrendingTopics from '@/components/features/news/TrendingTopics'

export default function NewsPage() {
  return (
    <div className="container mx-auto pt-20 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <NewsCategories />
          <NewsFeed />
        </div>
        <TrendingTopics />
      </div>
    </div>
  )
} 