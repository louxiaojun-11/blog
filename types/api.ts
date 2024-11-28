// 创建一个新文件来定义API接口类型
export interface Post {
  id: number;
  content: string;
  images?: string[];
  author: {
    id: number;
    username: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 新增接口定义
export interface Friend {
  id: number;
  username: string;
  avatar: string;
  status: 'online' | 'offline';
  lastActive: string;
}

export interface FriendRequest {
  id: number;
  from: {
    id: number;
    username: string;
    avatar: string;
  };
  mutualFriends: number;
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  cover: string;
  members: number;
  posts: number;
}

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  source: string;
  image: string;
  createdAt: string;
  comments: number;
}

export interface TrendingTopic {
  id: number;
  title: string;
  views: string;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
    avatar: string;
  };
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
} 