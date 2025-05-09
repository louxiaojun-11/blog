'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, UserCheck, Activity } from 'lucide-react'

interface DashboardInfo {
  onlineUserAmount: number
  todayBlogAmount: number
  userAmount: number
  todayActiveUserAmount: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [info, setInfo] = useState<DashboardInfo | null>(null)

  useEffect(() => {
    const fetchDashboardInfo = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8080/manage/admin/InfoController', {
          headers: {
            'token': sessionStorage.getItem('token') || ''
          }
        })

        const data = await response.json()
        if (data.success) {
          setInfo(data.data)
        }
      } catch (error) {
        console.error('获取控制台数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardInfo()
  }, [])

  const stats = [
    {
      label: '在线用户',
      value: info?.onlineUserAmount || 0,
      icon: UserCheck,
      color: 'bg-green-50 text-green-600',
      description: '当前在线用户数量'
    },
    {
      label: '今日发文',
      value: info?.todayBlogAmount || 0,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
      description: '今日平台发文数量'
    },
    {
      label: '用户总数',
      value: info?.userAmount || 0,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      description: '平台用户总数'
    },
    {
      label: '今日活跃',
      value: info?.todayActiveUserAmount || 0,
      icon: Activity,
      color: 'bg-orange-50 text-orange-600',
      description: '今日活跃用户数量'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-6 w-1/3 bg-gray-200 mb-2"></div>
            <div className="h-8 w-1/2 bg-gray-200 mb-2"></div>
            <div className="h-4 w-2/3 bg-gray-200"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow-lg p-6 transition-transform hover:scale-105">
          <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-4`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <h3 className="text-gray-500 text-sm mb-2">{stat.label}</h3>
          <div className="text-3xl font-bold mb-2">{stat.value}</div>
          <p className="text-sm text-gray-500">{stat.description}</p>
        </div>
      ))}
    </div>
  )
} 