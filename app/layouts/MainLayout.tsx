import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Header />
      <div className="container mx-auto flex gap-4 pt-16">
        <LeftSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
} 