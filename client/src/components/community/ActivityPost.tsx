import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Activity, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Check if user has liked this post
  const { data: likeStatus } = useQuery({
    queryKey: ["/api/posts", post.id, "like", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return { isLiked: false };
      const response = await fetch(`/api/posts/${post.id}/like/${currentUser.id}`);
      if (!response.ok) throw new Error("Failed to fetch like status");
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Update local state when like status is fetched
  useEffect(() => {
    if (likeStatus) {
      setIsLiked(likeStatus.isLiked);
    }
  }, [likeStatus]);

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
        await apiRequest("DELETE", `/api/posts/${post.id}/like`, { userId: currentUser?.id });
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`, { userId: currentUser?.id });
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
        authorId: currentUser?.id,
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const editPostMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("PATCH", `/api/posts/${post.id}`, { content });
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post bearbeitet",
        description: "Dein Post wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Post konnte nicht bearbeitet werden.",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post gelöscht",
        description: "Dein Post wurde erfolgreich gelöscht.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Post konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      if (navigator.share) {
        await navigator.share({
          title: `${post.author.displayName} - Wolkenkrümel`,
          text: post.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    },
    onSuccess: () => {
      toast({
        title: "Geteilt",
        description: "share" in navigator ? "Post wurde geteilt." : "Link wurde in die Zwischenablage kopiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Post konnte nicht geteilt werden.",
        variant: "destructive",
      });
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

  const handleEdit = () => {
    if (editContent.trim()) {
      editPostMutation.mutate(editContent);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Möchtest du diesen Post wirklich löschen?")) {
      deletePostMutation.mutate();
    }
  };

  const handleShare = () => {
    shareMutation.mutate();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) {
      return t('time.now');
    } else if (hours < 24) {
      const hourText = hours === 1 
        ? t('time.hour') 
        : t('time.hours');
      return `${hours} ${hourText} ${t('time.ago')}`;
    } else {
      const dayText = days === 1 
        ? t('time.day') 
        : t('time.days');
      return `${days} ${dayText} ${t('time.ago')}`;
    }
  };



  return (
    <Card className="shadow-sm">
      {/* Post Header */}
      <CardContent className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author?.avatarUrl} alt={post.author?.displayName || "User"} />
              <AvatarFallback>
                {(post.author?.displayName || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{post.author?.displayName || "Unbekannter Benutzer"}</h3>
              <p className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          {currentUser?.id === post.author?.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>

      {/* Post Content */}
      <CardContent className="px-6 pb-4">
        {isEditing ? (
          <div className="mb-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="mb-3"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
              >
                Abbrechen
              </Button>
              <Button 
                size="sm"
                onClick={handleEdit}
                disabled={!editContent.trim() || editPostMutation.isPending}
              >
                {editPostMutation.isPending ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground mb-4">{post.content}</p>
        )}
        
        {/* Linked Activity */}
        {post.linkedActivity && (
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{post.linkedActivity.title}</h4>
                <p className="text-sm text-muted-foreground">{post.linkedActivity.description}</p>
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
                isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="flex items-center space-x-2 text-muted-foreground hover:text-green-500"
            >
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">Teilen</span>
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
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.author?.avatarUrl} alt={comment.author?.displayName || "User"} />
                  <AvatarFallback>
                    {(comment.author?.displayName || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground">{comment.author?.displayName || "Unbekannter Benutzer"}</p>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="text-xs text-muted-foreground hover:text-primary">Like</button>
                    <button className="text-xs text-muted-foreground hover:text-primary">Reply</button>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="flex items-center space-x-3 mt-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.displayName || "User"} />
              <AvatarFallback>
                {(currentUser?.displayName || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
