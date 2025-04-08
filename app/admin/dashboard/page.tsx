'use client'

export default function AdminDashboard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">控制台</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 这里可以添加控制台卡片 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">待审核内容</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">今日新增用户</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">系统消息</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  )
} 