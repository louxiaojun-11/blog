'use client'

import { Image, Video, MapPin, Smile } from 'lucide-react'

export default function PostComposer() {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <textarea 
        placeholder="分享新鲜事..."
        className="w-full h-24 resize-none border-none focus:outline-none"
      />
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <div className="flex gap-4">
          <button className="hover:text-[#FF8200]">
            <Image className="h-6 w-6" />
          </button>
          <button className="hover:text-[#FF8200]">
            <Video className="h-6 w-6" />
          </button>
          <button className="hover:text-[#FF8200]">
            <MapPin className="h-6 w-6" />
          </button>
          <button className="hover:text-[#FF8200]">
            <Smile className="h-6 w-6" />
          </button>
        </div>
        <button className="bg-[#FF8200] text-white px-6 py-2 rounded-full hover:bg-[#ff9933]">
          发布
        </button>
      </div>
    </div>
  )
} 