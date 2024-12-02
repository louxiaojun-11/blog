'use client'

import MainLayout from '@/app/layouts/MainLayout'
import FollowList from '@/components/features/profile/FollowList'

export default function FollowPage() {
  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <FollowList />
      </div>
    </MainLayout>
  )
} 