import FollowFeed from '@/components/features/following/FollowFeed'
import FilterBar from '@/components/features/following/FilterBar'
import FollowSuggestions from '@/components/features/following/FollowSuggestions'

export default function FollowingPage() {
  return (
    <div className="container mx-auto flex gap-4 pt-20">
      <main className="flex-1 min-w-0">
        <FilterBar />
        <FollowFeed />
      </main>
      <FollowSuggestions />
    </div>
  )
} 