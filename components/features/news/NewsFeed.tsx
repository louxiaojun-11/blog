'use client'

import Image from 'next/image'
import { MessageSquare, Share, Bookmark } from 'lucide-react'

export default function NewsFeed() {
  const newsItems = [
    {
      id: 1,
      title: '最新科技发展趋势：AI 如何改变我们的生活',
      excerpt: '人工智能技术正在深刻影响着我们的日常生活，从智能家居到自动驾驶...',
      source: '科技日报',
      time: '2小时前',
      comments: 328,
      image: 'https://picsum.photos/200/200?random=1'
    },
    {
      id: 2,
      title: '全球经济展望：后疫情时代的机遇与挑战',
      excerpt: '随着全球经济逐步复苏，各国正面临新的发展机遇和挑战...',
      source: '财经周刊',
      time: '4小时前',
      comments: 156,
      image: 'https://picsum.photos/200/200?random=2'
    },
    {
      id: 3,
      title: '环保新趋势：可持续发展成为企业核心战略',
      excerpt: '越来越多的企业开始将可持续发展纳入其核心战略...',
      source: '环球视野',
      time: '6小时前',
      comments: 89,
      image: 'https://picsum.photos/200/200?random=3'
    }
  ]

  return (
    <div className="space-y-4">
      {newsItems.map((news) => (
        <article key={news.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 p-6">
              <h2 className="text-xl font-bold mb-2 hover:text-[#FF8200] cursor-pointer">
                {news.title}
              </h2>
              <p className="text-gray-600 mb-4">{news.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{news.source}</span>
                  <span>{news.time}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-[#FF8200]">
                    <MessageSquare className="h-5 w-5" />
                    <span>{news.comments}</span>
                  </button>
                  <button className="text-gray-500 hover:text-[#FF8200]">
                    <Share className="h-5 w-5" />
                  </button>
                  <button className="text-gray-500 hover:text-[#FF8200]">
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="md:w-1/3">
              <Image
                src={news.image}
                alt={news.title}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
} 