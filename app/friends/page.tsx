import FriendsList from '@/components/features/friends/FriendsList'
import FriendRequests from '@/components/features/friends/FriendRequests'
import FriendSearch from '@/components/features/friends/FriendSearch'

export default function FriendsPage() {
  return (
    <div className="container mx-auto pt-20 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          <FriendSearch />
          <FriendsList />
        </div>
        <FriendRequests />
      </div>
    </div>
  )
} 