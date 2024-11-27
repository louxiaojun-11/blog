'use client'

import { TrendingUp, ChevronRight } from 'lucide-react'

export default function TrendingTopics() {
  const trendingTopics = [
    { id: 1, title: '科技创新大会召开', views: '1280万' },
    { id: 2, title: '新能源汽车市场展望', views: '986万' },
    { id: 3, title: '教育改革最新动态', views: '645万' },
    { id: 4, title: '医疗健康发展趋势', views: '532万' },
    { id: 5, title: '文化产业投资机遇', views: '423万' }
  ]

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#FF8200]" />
          <h2 className="font-bold">热门话题</h2>
        </div>
        <button className="text-gray-400 hover:text-[#FF8200]">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-4">
        {trendingTopics.map((topic, index) => (
          <div key={topic.id} className="flex items-center gap-3">
            <span className={`w-5 h-5 flex items-center justify-center rounded ${
              index < 3 ? 'bg-[#FF8200] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {index + 1}
            </span>
            <div className="flex-1">
              <h3 className="font-medium hover:text-[#FF8200] cursor-pointer">
                {topic.title}
              </h3>
              <p className="text-sm text-gray-500">{topic.views} 阅读</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 