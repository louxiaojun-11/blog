'use client'

import { Music2, Video, Image } from 'lucide-react'
import MainLayout from '@/app/layouts/MainLayout'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CloudPage() {
  const categories = [
    { icon: Music2, label: '音乐', href: '/cloud/music' },
    { icon: Video, label: '视频', href: '/cloud/video' },
    { icon: Image, label: '照片', href: '/cloud/photos' },
  ]

  return (
    <MainLayout>
      <div className="pt-4 px-4">
        <h1 className="text-2xl font-bold mb-6">多媒体云盘</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#FF8200] bg-opacity-10 flex items-center justify-center">
                  <category.icon className="w-8 h-8 text-[#FF8200]" />
                </div>
                <span className="text-lg font-medium">{category.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  )
} 