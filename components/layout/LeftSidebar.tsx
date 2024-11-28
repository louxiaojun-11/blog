'use client'

import { Home, Users, UserPlus, Layout, Newspaper, FileText, PenSquare } from 'lucide-react'
import Link from 'next/link'

export default function LeftSidebar() {
  const menuItems = [
    { icon: Home, label: '首页', href: '/' },
    { icon: Users, label: '关注', href: '/following' },
    { icon: UserPlus, label: '好友', href: '/friends' },
    { icon: Layout, label: '小组', href: '/groups' },
    { icon: Newspaper, label: '资讯', href: '/news' },
    { icon: FileText, label: '我的博文', href: '/blog' },
    { icon: PenSquare, label: '写博文', href: '/blog/write' },
  ]

  return (
    <aside className="w-[280px] hidden lg:block">
      <div className="bg-white rounded-lg shadow p-4 sticky top-20">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 hover:text-[#FF8200]"
            >
              <item.icon className="h-6 w-6" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
} 