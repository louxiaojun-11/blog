'use client'

import { useState } from 'react'
import MainLayout from '@/app/layouts/MainLayout'
import GroupCategories from '@/components/features/groups/GroupCategories'
import GroupsList from '@/components/features/groups/GroupsList'
import MyCircles from '@/components/features/circles/MyCircles'
import MyPosts from '@/components/features/circles/MyPosts'

export default function GroupsPage() {
  const [selectedType, setSelectedType] = useState('全部')
  const [activeTab, setActiveTab] = useState('explore') // 'explore', 'myCircles', 'myPosts'

  return (
    <MainLayout>
      <div className="pt-4 px-4 space-y-4">
        {/* 标签切换 */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'explore'
                ? 'bg-[#FF8200] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            发现圈子
          </button>
          <button
            onClick={() => setActiveTab('myCircles')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'myCircles'
                ? 'bg-[#FF8200] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            我的圈子
          </button>
          <button
            onClick={() => setActiveTab('myPosts')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'myPosts'
                ? 'bg-[#FF8200] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            我的帖子
          </button>
        </div>

        {/* 内容区域 */}
        {activeTab === 'explore' && (
          <>
            <GroupCategories
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
            <GroupsList selectedType={selectedType} />
          </>
        )}
        {activeTab === 'myCircles' && <MyCircles />}
        {activeTab === 'myPosts' && <MyPosts />}
      </div>
    </MainLayout>
  )
} 