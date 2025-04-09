'use client'

import { useState, useEffect } from 'react'
import { adminService } from '@/services/adminApi'
import Image from 'next/image'
import { Search, ArrowUpDown, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface User {
  userId: number
  username: string
  account: string
  avatar: string
  status: string
  lastActive: string
  createdAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)
  const [searchKey, setSearchKey] = useState<string>('')
  const [timeOrder, setTimeOrder] = useState(true)
  const router = useRouter()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminService.getUserList(
        page, 
        pageSize, 
        searchKey.trim() === '' ? null : searchKey, 
        timeOrder
      )
      
      if (response.success) {
        setUsers(response.data.records)
        setTotalUsers(response.data.total)
      } else {
        setError(response.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, pageSize, timeOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // 重置页码
    fetchUsers()
  }

  const handleToggleTimeOrder = () => {
    setTimeOrder(!timeOrder)
  }

  const viewUserBlogs = (userId: number) => {
    router.push(`/admin/users/blogs?userId=${userId}`)
  }

  const totalPages = Math.ceil(totalUsers / pageSize)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>
      
      {/* 搜索和排序控制 */}
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="搜索用户名或账号"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className="border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
        
        <button
          onClick={handleToggleTimeOrder}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          <ArrowUpDown className="w-5 h-5" />
          <span>{timeOrder ? '最新注册' : '最早注册'}</span>
        </button>
      </div>
      
      {/* 用户列表 */}
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">头像</th>
                  <th className="py-3 px-4 text-left">用户名</th>
                  <th className="py-3 px-4 text-left">账号</th>
                  <th className="py-3 px-4 text-left">状态</th>
                  <th className="py-3 px-4 text-left">上次活跃</th>
                  <th className="py-3 px-4 text-left">注册时间</th>
                  <th className="py-3 px-4 text-left">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{user.userId}</td>
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 relative">
                        <Image
                          src={user.avatar || '/default-avatar.png'}
                          alt={user.username}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.username}</td>
                    <td className="py-3 px-4">{user.account}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status === 'online' ? '在线' : '离线'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.lastActive}</td>
                    <td className="py-3 px-4">{user.createdAt}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => viewUserBlogs(user.userId)}
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                      >
                        <FileText className="w-4 h-4" />
                        查看博文
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 分页控制 */}
          <div className="flex justify-between items-center mt-6">
            <div>
              总共 <span className="font-medium">{totalUsers}</span> 个用户
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4">
                {page} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                下一页
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1) // 重置页码
                }}
                className="ml-4 px-2 py-1 border border-gray-300 rounded focus:outline-none"
              >
                <option value={5}>5条/页</option>
                <option value={10}>10条/页</option>
                <option value={20}>20条/页</option>
                <option value={50}>50条/页</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 