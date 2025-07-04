import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Activity } from "lucide-react";

interface ActivityPostProps {
  post: {
    id: number;
    content: string;
    author: {
      id: number;
      displayName: string;
      avatarUrl: string;
    };
    linkedActivity?: {
      id: number;
      title: string;
      description: string;
    };
    likes: number;
    comments: number;
    imageUrl?: string;
    createdAt: string;
  };
}

export default function ActivityPost({ post }: ActivityPostProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments } = useQuery({
    queryKey: ["/api/posts", post.id, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`, { userId: 1 });
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`, { userId: 1 });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/comments", {
        content,
        postId: post.id,
        authorId: 1,
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (newComment.trim()) {
      commentMutation.mutate(newComment);
    }
  };

  const handleCommentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleComment();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <Card className="shadow-sm">
      {/* Post Header */}
      <CardContent className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              className="w-10 h-10 rounded-full" 
              src={post.author?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"}
              alt="User Avatar" 
            />
            <div>
              <h3 className="font-semibold text-neutral">{post.author?.displayName || "Unbekannter Benutzer"}</h3>
              <p className="text-sm text-gray-600">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>

      {/* Post Content */}
      <CardContent className="px-6 pb-4">
        <p className="text-gray-800 mb-4">{post.content}</p>
        
        {/* Linked Activity */}
        {post.linkedActivity && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-neutral">{post.linkedActivity.title}</h4>
                <p className="text-sm text-gray-600">{post.linkedActivity.description}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Post Image */}
      {post.imageUrl && (
        <CardContent className="px-6 pb-4">
          <img 
            src={post.imageUrl} 
            alt="Post image" 
            className="rounded-lg w-full h-64 object-cover" 
          />
        </CardContent>
      )}

      {/* Post Actions */}
      <CardContent className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-500"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-gray-600 hover:text-green-500"
            >
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-yellow-500"
          >
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>

      {/* Comments Section */}
      {showComments && (
        <CardContent className="px-6 pb-6">
          <div className="space-y-4">
            {comments?.map((comment: any) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <img 
                  className="w-8 h-8 rounded-full" 
                  src={comment.author.avatarUrl || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"}
                  alt="Commenter Avatar" 
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-neutral">{comment.author.displayName || "Anonymous User"}</p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="text-xs text-gray-500 hover:text-primary">Like</button>
                    <button className="text-xs text-gray-500 hover:text-primary">Reply</button>
                    <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="flex items-center space-x-3 mt-4">
            <img 
              className="w-8 h-8 rounded-full" 
              src="https://images.unsplash.com/photo-1494790108755-2616c6d5e37c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
              alt="User Avatar" 
            />
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleCommentKeyPress}
                className="rounded-full"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
