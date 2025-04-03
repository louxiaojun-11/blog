import axios from 'axios';
import { 
  Post, 
  ApiResponse, 
  Friend, 
  FriendRequest, 
  Group, 
  NewsItem, 
  TrendingTopic, 
  BlogPost,
  Comment,
  GroupDetail
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
      const response = await api.get<ApiResponse<Friend[]>>('/relation/friends');
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
  getUserBlogs: async (params: {
    userId?: number;
    page: number;
    pageSize: number;
  }) => {
    try {
      const response = await api.get<ApiResponse<{
        total: number;
        records: BlogPost[];
      }>>('/user/bloglist', {
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      throw error;
    }
  },

  createBlog: async (blogData: {
    title: string;
    content: string;
    userId: number;
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
  },

  // 点赞博文
  clickLike: async (userId: number, blogId: number) => {
    try {
      const response = await api.post<ApiResponse<number>>('/blog/clickLike', {
        userId,
        blogId
      });
      return response.data;
    } catch (error) {
      console.error('Error clicking like:', error);
      throw error;
    }
  },

  // 取消点赞
  removeLike: async (userId: number, blogId: number) => {
    try {
      const response = await api.put<ApiResponse<boolean>>('/blog/removeLike', {
        userId,
        blogId
      });
      return response.data;
    } catch (error) {
      console.error('Error removing like:', error);
      throw error;
    }
  },

  // 获取评论列表
  getComments: async (blogId: number, page: number = 1, pageSize: number = 10) => {
    try {
      const response = await api.get<ApiResponse<{
        total: number;
        records: Comment[];
      }>>(`/blog/commentList?blogId=${blogId}&page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // 添加评论
  addComment: async (data: {
    userId: number;
    blogId: number;
    content: string;
  }) => {
    try {
      const response = await api.post<ApiResponse<Comment>>('/blog/addComment', data);
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // 添加搜索博文方法
  searchBlogs: async ({ keyword, page = 1, pageSize = 10 }: { keyword: string, page?: number, pageSize?: number }) => {
    try {
      // 使用api实例发送请求到后端SpringBoot API
      const response = await api.get<ApiResponse<{
        total: number;
        records: BlogPost[];
      }>>('/blog/searchBlogs', {
        params: { keyword, page, pageSize }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching blogs:', error);
      throw error;
    }
  },
};

interface RegisterData {
  username: string;
  account: string;
  password: string;
  avatar: string;
  introduce: string;
}

export const authService = {
  login: async (account: string, password: string) => {
    console.log('Sending login request with:', { account, password });
    try {
      const response = await api.post('/user/login', { account, password });
      console.log('Raw response:', response);
      
      // 确保返回的数据格式正确
      if (response.data.success && response.data.data) {
        const userData = {
          userId: response.data.data.userId,
          account: response.data.data.account,
          username: response.data.data.username,
          avatar: response.data.data.avatar
        };
        return {
          success: true,
          data: {
            ...userData,
            token: response.data.data.token
          }
        };
      }
      return response.data;
    } catch (error) {
      console.error('Login request error:', error);
      throw error;
    }
  },

  register: async (data: {
    username: string;
    account: string;
    password: string;
    introduce: string;
  }) => {
    try {
      const response = await api.post('/user/register', data);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }
};

export const uploadService = {
  uploadFile: async (formData: FormData) => {
    try {
      const response = await api.post<ApiResponse<string>>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
};

export const userService = {
  updateUserInfo: async (userData: {
    userId: number;
    username?: string;
    avatar?: string;
    password?: string;
    oldPassword?: string;
  }) => {
    try {
      const response = await api.put<ApiResponse<any>>('/user', userData);
      console.log('Update user response:', response); // 添加调试日志
      
      // 直接返回 response.data，不再做额外判断
      return response.data;
      
    } catch (error) {
      console.error('Error updating user info:', error);
      throw error;
    }
  },

  // 修改获取用户密码的方法中的请求路径
  getUserPassword: async (userId: number) => {
    try {
      const response = await api.get<ApiResponse<string>>(`/user/password?userId=${userId}`);
      // 直接返回 response.data，因为密码就是 data 字段的值
      return response.data;
    } catch (error) {
      console.error('Error getting user password:', error);
      throw error;
    }
  },

  getUserProfile: async (userId: number) => {
    try {
      const response = await api.get<ApiResponse<{
        following: number;
        follower: number;
        introduce: string;
      }>>(`/user/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  updateUserIntroduce: async (userId: number, introduce: string) => {
    try {
      const response = await api.put<ApiResponse<any>>(`/user/profile/introduce`, {
        userId,
        introduce
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user introduce:', error);
      throw error;
    }
  },

  getFollowers: async (userId: number) => {
    try {
      const response = await api.get<ApiResponse<{
        relationId: number;
        username: string;
        avatar: string;
      }[]>>(`/relation/follower`);
      return response.data;
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  },

  getFollowing: async (userId: number) => {
    try {
      const response = await api.get<ApiResponse<{
        relationId: number;
        username: string;
        avatar: string;
      }[]>>(`/relation/following`);
      return response.data;
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  },

  getUserRelationProfile: async (userId: number, page: number = 1, pageSize: number = 5) => {
    try {
      const response = await api.get<ApiResponse<{
        relationId: number;
        username: string;
        avatar: string;
        following: number;
        follower: number;
        introduce: string | null;
        status: number;
        pageResult: {
          total: number;
          records: {
            id: number;
            title: string;
            content: string;
            userId: number;
            likes: number;
            views: number;
            comments: number;
            createdAt: string;
            updatedAt: string;
          }[];
        };
      }>>(`/relation/profile?userId=${userId}&page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user relation profile:', error);
      throw error;
    }
  },

  searchUsers: async (searchContent: string) => {
    try {
      const response = await api.get<ApiResponse<{
        relationId: number;
        username: string;
        avatar: string;
      }[]>>('/relation/search', {
        params: { searchContent }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  followUser: async (relationId: number) => {
    try {
      const response = await api.put<ApiResponse<any>>(`/relation/follow?relationId=${relationId}`);
      return response.data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  unfollowUser: async (relationId: number) => {
    try {
      const response = await api.put<ApiResponse<any>>(`/relation/cancelfollow?relationId=${relationId}`);
      return response.data;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }
};

export const hobbyService = {
  createGroup: async (data: {
    userId: number;
    groupName: string;
    introduce: string;
    avatar: string;
    type: string;
  }) => {
    try {
      const response = await api.post<ApiResponse<any>>('/hobby/createGroup', data);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // 获取圈子列表（支持按类别查询）
  getGroupList: async (params: {
    userId?: number;
    page: number;
    pageSize: number;
    type?: string;
  }) => {
    try {
      const response = await api.get<ApiResponse<{
        total: number;
        records: {
          groupId: number;
          groupName: string;
          avatar: string;
          introduce: string;
          members: number;
        }[];
      }>>('/hobby/groupList', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching group list:', error);
      throw error;
    }
  },

  // 获取圈子博文列表
  getGroupBlogList: async ({ groupId, page, pageSize }: { groupId: number; page: number; pageSize: number }) => {
    try {
      const response = await api.get<ApiResponse<{
        total: number;
        records: {
          id: number;
          title: string;
          content: string;
          username: string;
          likes: number;
          comments: number;
          createdAt: string;
        }[];
      }>>('/hobby/groupBlogList', {
        params: { groupId, page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching group blog list:', error);
      throw error;
    }
  },

  // 获取圈子信息
  getGroupInfo: async (groupId: number, userId: number) => {
    try {
      const response = await api.get<ApiResponse<GroupDetail>>(`/hobby/groupInfo?groupId=${groupId}&userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group info:', error);
      throw error;
    }
  },

  // 加入圈子
  joinGroup: async (groupId: number, userId: number) => {
    try {
      const response = await api.post<ApiResponse<boolean>>('/hobby/joinGroup', {
        groupId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  },

  // 退出圈子
  quitGroup: async (groupId: number, userId: number) => {
    try {
      const response = await api.put<ApiResponse<boolean>>('/hobby/quitGroup', {
        groupId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error quitting group:', error);
      throw error;
    }
  },

  // 获取圈子博文详情
  getGroupBlogDetail: async (blogId: string) => {
    try {
      const response = await api.get<ApiResponse<{
        groupId: string;
        blogId: string;
        userId: string;
        title: string;
        content: string;
        pic1: string | null;
        pic2: string | null;
        pic3: string | null;
        pic4: string | null;
        likes: number;
        comments: number;
        createdAt: string;
      }>>('/hobby/groupBlogDetail', {
        params: { blogId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching group blog detail:', error);
      throw error;
    }
  },

  // 获取博主信息
  getGroupBlogUser: async (userId: string) => {
    try {
      const response = await api.get<ApiResponse<{
        username: string;
        avatar: string;
        introduce: string;
      }>>('/hobby/groupBlogUser', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching group blog user:', error);
      throw error;
    }
  },

  postHobbyBlog: async (data: {
    userId: number;
    groupId: number;
    title: string;
    content: string;
    pic1: string | null;
    pic2: string | null;
    pic3: string | null;
    pic4: string | null;
  }) => {
    try {
      const response = await api.post<ApiResponse<any>>('/hobby/postHobbyBlog', data);
      return response.data;
    } catch (error) {
      console.error('Error posting hobby blog:', error);
      throw error;
    }
  },

  clickLike: async (data: { userId: number; blogId: number }) => {
    try {
      const response = await api.post<ApiResponse<number>>('/hobby/clickLike', data)
      return response.data
    } catch (error) {
      console.error('Error clicking like:', error)
      throw error
    }
  },

  removeLike: async (data: { userId: number; blogId: number }) => {
    try {
      const response = await api.put<ApiResponse<void>>('/hobby/removeLike', data)
      return response.data
    } catch (error) {
      console.error('Error removing like:', error)
      throw error
    }
  },

  getComments: async (blogId: number, page: number = 1, pageSize: number = 6) => {
    try {
      const response = await api.get<ApiResponse<{
        total: number;
        records: Comment[];
      }>>(`/hobby/commentList?blogId=${blogId}&page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  addComment: async (data: {
    userId: number;
    blogId: number;
    content: string;
  }) => {
    try {
      const response = await api.post<ApiResponse<Comment>>('/hobby/addComment', data);
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  getUserHobbyBlogList: async (userId: number, page: number, pageSize: number) => {
    try {
      const response = await api.get<ApiResponse<{
        total: number;
        records: {
          userId: number;
          groupId: number;
          blogId: number;
          groupName: string;
          title: string;
          content: string;
          likes: number;
          comments: number;
          createdAt: string;
          type: string;
        }[];
      }>>(`/hobby/userHobbyBlogList?userId=${userId}&page=${page}&pageSize=${pageSize}`)
      console.log('Raw API response:', response.data) // 添加调试日志
      return response.data
    } catch (error) {
      console.error('Error fetching user hobby blog list:', error)
      throw error
    }
  },
};

interface MusicItem {
  musicId: number;
  musicUrl: string;
  musicName: string;
  createdAt: string;
}

export const musicService = {
  getUserMusic: async (params: {
    userId: number;
    page: number;
    pageSize: number;
  }) => {
    try {
      const response = await api.get<ApiResponse<{
        total: number;
        records: MusicItem[];
      }>>('/user/musicList', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching music list:', error);
      throw error;
    }
  }
}; 