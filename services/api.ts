import axios from 'axios';
import { 
  Post, 
  ApiResponse, 
  Friend, 
  FriendRequest, 
  Group, 
  NewsItem, 
  TrendingTopic, 
  BlogPost 
} from '@/types/api';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 获取 token
    const token = sessionStorage.getItem('token');
    
    // 确保 config.headers 存在
    if (!config.headers) {
      config.headers = {};
    }

    // 如果有 token，添加到请求头，使用 'token' 作为头名称
    if (token) {
      config.headers.token = token;
    }

    // 确保设置了正确的 Content-Type
    if (!config.headers['Content-Type'] && !config.headers.get('Content-Type')) {
      config.headers['Content-Type'] = 'application/json';
    }

    console.log('Request with headers:', config.headers); // 调试日志
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response); // 调试日志
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 401) {
      // token 失效，清除所有登录状态
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 在 postService 中添加模拟数据
const mockPosts: Post[] = [
  {
    id: 1,
    content: '这是一条测试微博内容',
    author: {
      id: 1,
      username: '测试用户',
      avatar: 'https://picsum.photos/48/48?random=1'
    },
    createdAt: '2小时前',
    likes: 42,
    comments: 5,
    shares: 2,
    images: ['https://picsum.photos/600/400?random=1']
  },
  {
    id: 2,
    content: '又是一条测试微博',
    author: {
      id: 2,
      username: '另一个用户',
      avatar: 'https://picsum.photos/48/48?random=2'
    },
    createdAt: '5小时前',
    likes: 18,
    comments: 3,
    shares: 1
  }
];

export const postService = {
  getPosts: async (page: number = 0, size: number = 10) => {
    // 模拟API调用
    return {
      success: true,
      data: mockPosts
    };
  },

  likePost: async (postId: number) => {
    const response = await api.post<ApiResponse<{ likes: number }>>(`/posts/${postId}/like`);
    return response.data;
  },

  createPost: async (content: string, images?: string[]) => {
    const response = await api.post<ApiResponse<Post>>('/posts', {
      content,
      images
    });
    return response.data;
  }
};

export const friendService = {
  getFriends: async () => {
    try {
      const response = await api.get<ApiResponse<Friend[]>>('/friends');
      return response.data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      // 返回模拟数据
      return {
        success: true,
        data: [
          {
            id: 6,
            username: "张三丰",
            avatar: "https://picsum.photos/48/48?random=6",
            status: "online",
            lastActive: "刚刚"
          },
          {
            id: 7,
            username: "张无忌",
            avatar: "https://picsum.photos/48/48?random=7",
            status: "offline",
            lastActive: "1天前"
          }
        ]
      };
    }
  },

  getFriendRequests: async () => {
    const response = await api.get<ApiResponse<FriendRequest[]>>('/friends/requests');
    return response.data;
  },

  handleFriendRequest: async (requestId: number, action: 'accept' | 'reject') => {
    const response = await api.post<ApiResponse<boolean>>(`/friends/requests/${requestId}`, { action });
    return response.data;
  },

  searchFriends: async (query: string) => {
    const response = await api.get<ApiResponse<Friend[]>>('/friends/search', {
      params: { q: query }
    });
    return response.data;
  }
};

export const groupService = {
  getGroups: async (category?: string, page: number = 0, size: number = 10) => {
    const response = await api.get<ApiResponse<{
      content: Group[];
      totalPages: number;
    }>>('/groups', {
      params: { category, page, size }
    });
    return response.data;
  },

  joinGroup: async (groupId: number) => {
    const response = await api.post<ApiResponse<{
      success: boolean;
      currentMembers: number;
    }>>(`/groups/${groupId}/membership`, { action: 'join' });
    return response.data;
  },

  leaveGroup: async (groupId: number) => {
    const response = await api.post<ApiResponse<{
      success: boolean;
      currentMembers: number;
    }>>(`/groups/${groupId}/membership`, { action: 'leave' });
    return response.data;
  }
};

export const newsService = {
  getNews: async (category?: string, page: number = 0, size: number = 10) => {
    const response = await api.get<ApiResponse<{
      content: NewsItem[];
      totalPages: number;
    }>>('/news', {
      params: { category, page, size }
    });
    return response.data;
  },

  getTrendingTopics: async () => {
    const response = await api.get<ApiResponse<TrendingTopic[]>>('/news/trending');
    return response.data;
  }
};

export const blogService = {
  getUserBlogs: async () => {
    try {
      const response = await api.get<ApiResponse<BlogPost[]>>('/user/bloglist');
      return response.data;
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      throw error;
    }
  },

  createBlog: async (blogData: {
    title: string;
    content: string;
    user_id: number;
  }) => {
    try {
      const response = await api.post<ApiResponse<BlogPost>>('/blog', blogData);
      return response.data;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  deleteBlog: async (blogId: number) => {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`/blog?id=${blogId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }
};

// 添加登录服务
export const authService = {
  login: async (account: string, password: string) => {
    console.log('Sending login request with:', { account, password });
    try {
      const response = await api.post('/user/login', { account, password });
      console.log('Raw response:', response);
      return response.data;
    } catch (error) {
      console.error('Login request error:', error);
      throw error;
    }
  }
}; 