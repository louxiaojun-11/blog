import MainLayout from '@/app/layouts/MainLayout'
import Feed from "@/components/layout/Feed"
import RightSidebar from "@/components/layout/RightSidebar"

export default function Home() {
  return (
    <MainLayout>
      <div className="flex gap-4 pt-4 px-4">
        <Feed />
        <RightSidebar />
      </div>
    </MainLayout>
  )
}
