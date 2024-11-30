'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MessageCircle, UserMinus } from 'lucide-react'
import { Friend } from '@/types/api'
import { friendService } from '@/services/api'

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoading(true);
        const response = await friendService.getFriends();
        if (response.success) {
          const formattedFriends = response.data.map(friend => ({
            ...friend,
            status: friend.status as 'online' | 'offline'
          }));
          setFriends(formattedFriends);
        }
      } catch (err) {
        setError('Failed to load friends');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="font-bold">好友列表</h2>
        <p className="text-sm text-gray-500">共 {friends.length} 位好友</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {friends.map((friend) => (
          <div key={friend.userId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <Image
              src={friend.avatar}
              alt={friend.username}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div className="flex-1">
              <h3 className="font-medium">{friend.username}</h3>
              <p className="text-sm text-gray-500">
                {friend.status === 'online' ? (
                  <span className="text-green-500">● 在线</span>
                ) : (
                  <span className="text-gray-400">最后活跃: {friend.lastActive}</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <MessageCircle className="w-5 h-5 text-[#FF8200]" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <UserMinus className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 