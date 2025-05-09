'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Users, FileCheck, Megaphone, LayoutDashboard, Settings, Newspaper, ChevronDown, ChevronRight, AlertTriangle, UsersIcon } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { admin, logout } = useAdminAuth()
  const router = useRouter()
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    hobby: false
  })

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }))
  }

  const menuItems = [
    { icon: Users, label: '用户管理', href: '/admin/users' },
    { icon: Newspaper, label: '资讯管理', href: '/admin/information' },
    {
      icon: UsersIcon,
      label: '兴趣圈子管理',
      key: 'hobby',
      subItems: [
        { label: '圈子管理', href: '/admin/hobby/groups' },
        { label: '圈子创建审核', href: '/admin/hobby/audit' }
      ]
    },
    { icon: Megaphone, label: '公告管理', href: '/admin/announcements' },
    { icon: AlertTriangle, label: '敏感词管理', href: '/admin/sensitive-words' },
    { icon: LayoutDashboard, label: '控制台', href: '/admin/dashboard' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white shadow-md h-screen fixed">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800">管理后台</h1>
          </div>
          <nav className="mt-8">
            {menuItems.map((item) => (
              <div key={item.href || item.key}>
                {item.subItems ? (
                  // 带下拉菜单的项目
                  <div>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </div>
                      {expandedMenus[item.key] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {expandedMenus[item.key] && (
                      <div className="bg-gray-50">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block pl-12 py-2 text-gray-600 hover:bg-gray-100"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // 普通菜单项
                  <Link
                    href={item.href}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          <div className="absolute bottom-0 w-full p-4">
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
            >
              退出登录
            </button>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 