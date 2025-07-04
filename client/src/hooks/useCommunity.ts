import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export interface CommunityUser {
  id: number;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  subscriptionTier: string;
  activitiesCreated: number;
  postsCreated: number;
  likesReceived: number;
  isFollowing?: boolean;
}

export interface CommunityPost {
  id: number;
  content: string;
  type: 'post' | 'question' | 'success_story';
  author: CommunityUser;
  linkedActivity?: {
    id: number;
    title: string;
    description: string;
  };
  likes: number;
  comments: number;
  imageUrl?: string;
  videoUrl?: string;
  tags?: string[];
  isLiked?: boolean;
  createdAt: string;
}

export interface CommunityComment {
  id: number;
  content: string;
  author: CommunityUser;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: CommunityComment[];
}

export interface CreatePostData {
  content: string;
  type: 'post' | 'question' | 'success_story';
  authorId: number;
  linkedActivityId?: number;
  tags?: string[];
}

export interface CreateCommentData {
  content: string;
  postId: number;
  authorId: number;
  parentId?: number;
}

export function useCommunityPosts(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["/api/posts", { limit, offset }],
    queryFn: async (): Promise<CommunityPost[]> => {
      const response = await fetch(`/api/posts?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCommunityPost(postId: number) {
  return useQuery({
    queryKey: ["/api/posts", postId],
    queryFn: async (): Promise<CommunityPost> => {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      return response.json();
    },
    enabled: !!postId,
  });
}

export function usePostComments(postId: number) {
  return useQuery({
    queryKey: ["/api/posts", postId, "comments"],
    queryFn: async (): Promise<CommunityComment[]> => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePostData): Promise<CommunityPost> => {
      const response = await apiRequest("POST", "/api/posts", data);
      return response.json();
    },
    onSuccess: (newPost) => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      
      // Optimistically add the new post to the cache
      queryClient.setQueryData(["/api/posts", { limit: 20, offset: 0 }], (oldData: CommunityPost[] | undefined) => {
        if (!oldData) return [newPost];
        return [newPost, ...oldData];
      });

      toast({
        title: "Post Created",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCommentData): Promise<CommunityComment> => {
      const response = await apiRequest("POST", "/api/comments", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate comments for the specific post
      queryClient.invalidateQueries({ 
        queryKey: ["/api/posts", variables.postId, "comments"] 
      });
      
      // Update post comment count
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });

      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, userId, isLiked }: { 
      postId: number; 
      userId: number; 
      isLiked: boolean;
    }) => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${postId}/like`, { userId });
      } else {
        await apiRequest("POST", `/api/posts/${postId}/like`, { userId });
      }
    },
    onSuccess: (_, variables) => {
      // Optimistically update the post data
      queryClient.setQueryData(["/api/posts", variables.postId], (oldData: CommunityPost | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          likes: variables.isLiked ? oldData.likes - 1 : oldData.likes + 1,
          isLiked: !variables.isLiked,
        };
      });

      // Also update in the posts list
      queryClient.setQueryData(["/api/posts", { limit: 20, offset: 0 }], (oldData: CommunityPost[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(post => 
          post.id === variables.postId 
            ? {
                ...post,
                likes: variables.isLiked ? post.likes - 1 : post.likes + 1,
                isLiked: !variables.isLiked,
              }
            : post
        );
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive",
      });
    },
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      followerId, 
      followingId, 
      isFollowing 
    }: { 
      followerId: number; 
      followingId: number; 
      isFollowing: boolean;
    }) => {
      if (isFollowing) {
        await apiRequest("DELETE", `/api/users/${followingId}/follow`, { followerId });
      } else {
        await apiRequest("POST", `/api/users/${followingId}/follow`, { followerId });
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate suggested users and following lists
      queryClient.invalidateQueries({ queryKey: ["/api/suggested-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", variables.followerId, "following"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", variables.followingId, "followers"] });

      toast({
        title: variables.isFollowing ? "Unfollowed" : "Following",
        description: variables.isFollowing 
          ? "You are no longer following this user." 
          : "You are now following this user.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useTrendingTags() {
  return useQuery({
    queryKey: ["/api/trending-tags"],
    queryFn: async (): Promise<{ tag: string; count: number }[]> => {
      const response = await fetch("/api/trending-tags");
      if (!response.ok) throw new Error("Failed to fetch trending tags");
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useSuggestedUsers(userId: number) {
  return useQuery({
    queryKey: ["/api/suggested-users", { userId }],
    queryFn: async (): Promise<CommunityUser[]> => {
      const response = await fetch(`/api/suggested-users?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch suggested users");
      return response.json();
    },
    enabled: !!userId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCommunityEvents(limit = 10) {
  return useQuery({
    queryKey: ["/api/events", { limit }],
    queryFn: async () => {
      const response = await fetch(`/api/events?limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserNotifications(userId: number) {
  return useQuery({
    queryKey: ["/api/notifications", { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    enabled: !!userId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time feel
  });
}

// Helper hook for infinite scroll posts
export function useInfiniteCommunityPosts() {
  const queryClient = useQueryClient();
  
  return {
    // This would implement infinite scroll logic
    // For now, we'll use the regular pagination approach
    // In a real implementation, you'd use useInfiniteQuery from React Query
  };
}

// Helper hook for real-time updates
export function useCommunityRealtime(userId: number) {
  // This would implement WebSocket connections for real-time updates
  // For now, we'll use polling with shorter intervals
  
  const { data: notifications } = useUserNotifications(userId);
  
  return {
    unreadCount: notifications?.filter((n: any) => !n.isRead).length || 0,
    hasNewActivity: false, // Would be determined by WebSocket events
  };
}
