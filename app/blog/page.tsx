import MainLayout from '@/app/layouts/MainLayout'
import BlogList from '@/components/features/blog/BlogList'

export default function BlogPage() {
  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <h1 className="text-2xl font-bold mb-6">我的博文</h1>
        <BlogList />
      </div>
    </MainLayout>
  )
} 