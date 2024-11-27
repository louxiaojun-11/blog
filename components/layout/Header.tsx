'use client'

import { Search, Home, Video, MessageCircle, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Image 
            src="/next.svg" 
            alt="Logo" 
            width={100} 
            height={30}
            className="dark:invert"
          />
          <div className="relative">
            <input
              type="search"
              placeholder="搜索"
              className="pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF8200]"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-[#FF8200]">
            <Home className="h-6 w-6" />
          </Link>
          <Link href="/video" className="hover:text-[#FF8200]">
            <Video className="h-6 w-6" />
          </Link>
          <Link href="/messages" className="hover:text-[#FF8200]">
            <MessageCircle className="h-6 w-6" />
          </Link>
          <Link href="/profile" className="hover:text-[#FF8200]">
            <User className="h-6 w-6" />
          </Link>
        </nav>
      </div>
    </header>
  )
} 