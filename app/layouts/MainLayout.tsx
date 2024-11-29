import Header from '@/components/layout/Header'
import LeftSidebar from '@/components/layout/LeftSidebar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F2F2F2] overflow-y-scroll scrollbar-gutter-stable">
      <Header />
      <div className="container max-w-7xl mx-auto flex gap-4 pt-16 px-4">
        <aside className="w-[280px] flex-shrink-0">
          <LeftSidebar />
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
} 