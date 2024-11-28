import BlogList from '@/components/features/blog/BlogList'

export default function BlogPage() {
  return (
    <div className="container mx-auto pt-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">我的博文</h1>
        <BlogList />
      </div>
    </div>
  )
} 