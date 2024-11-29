import MainLayout from '@/app/layouts/MainLayout'
import FollowFeed from '@/components/features/following/FollowFeed'
import FilterBar from '@/components/features/following/FilterBar'
import FollowSuggestions from '@/components/features/following/FollowSuggestions'

export default function FollowingPage() {
  return (
    <MainLayout>
      <div className="flex gap-4 pt-4">
        <div className="flex-1 min-w-0">
          <FilterBar />
          <FollowFeed />
        </div>
        <FollowSuggestions />
      </div>
    </MainLayout>
  )
} 