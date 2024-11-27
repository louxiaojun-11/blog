'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'
import { Post } from '@/types/api'
import { postService } from '@/services/api'

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      const response = await postService.likePost(post.id);
      if (response.success) {
        setLikes(response.data.likes);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start gap-3">
        <Image
          src={post.author.avatar}
          alt={post.author.username}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold">{post.author.username}</h3>
              <p className="text-sm text-gray-500">{post.createdAt}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          <p className="mt-2">{post.content}</p>
          
          {post.images && post.images.length > 0 && (
            <Image
              src={post.images[0]}
              alt="Post image"
              width={600}
              height={400}
              className="rounded-lg mt-3"
            />
          )}

          <div className="flex gap-6 mt-4 text-gray-500">
            <button 
              className="flex items-center gap-2 hover:text-[#FF8200]"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className="h-5 w-5" />
              <span>{likes}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#FF8200]">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#FF8200]">
              <Share className="h-5 w-5" />
              <span>{post.shares}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
} 