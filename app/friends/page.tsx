import MainLayout from '@/app/layouts/MainLayout'
import FriendsList from '@/components/features/friends/FriendsList'

export default function FriendsPage() {
  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <FriendsList />
      </div>
    </MainLayout>
  )
} 