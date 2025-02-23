'use client'

import { useState } from 'react'
import MainLayout from '@/app/layouts/MainLayout'
import CircleExplorer from '@/components/features/circles/CircleExplorer'
import MyCircles from '@/components/features/circles/MyCircles'
import MyPosts from '@/components/features/circles/MyPosts'

type TabType = 'explore' | 'myCircles' | 'myPosts'

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('explore')

  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return <CircleExplorer />
      case 'myCircles':
        return <MyCircles />
      case 'myPosts':
        return <MyPosts />
      default:
        return null
    }
  }

  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-full ${
              activeTab === 'explore'
                ? 'bg-[#FF8200] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            探索圈子
          </button>
          <button
            onClick={() => setActiveTab('myCircles')}
            className={`px-4 py-2 rounded-full ${
              activeTab === 'myCircles'
                ? 'bg-[#FF8200] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            我的圈子
          </button>
          <button
            onClick={() => setActiveTab('myPosts')}
            className={`px-4 py-2 rounded-full ${
              activeTab === 'myPosts'
                ? 'bg-[#FF8200] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            我的帖子
          </button>
        </div>
        {renderContent()}
      </div>
    </MainLayout>
  )
} 