import MainLayout from '@/app/layouts/MainLayout'
import GroupsList from '@/components/features/groups/GroupsList'
import GroupCategories from '@/components/features/groups/GroupCategories'
import GroupDiscovery from '@/components/features/groups/GroupDiscovery'

export default function GroupsPage() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 pt-4 px-4">
        <div className="space-y-4">
          <GroupCategories />
          <GroupsList />
        </div>
        <GroupDiscovery />
      </div>
    </MainLayout>
  )
} 