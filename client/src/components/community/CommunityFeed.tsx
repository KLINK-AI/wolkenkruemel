import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { MessageCircle, Heart, Trophy, HelpCircle, FileText, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi, postApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CommentSection } from "@/components/CommentSection";

// Helper functions for post types
function getPostTypeIcon(type: string) {
  switch (type) {
    case "question":
      return <HelpCircle className="w-4 h-4 text-blue-500" />;
    case "success_story":
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
}

function getPostTypeLabel(type: string) {
  switch (type) {
    case "question":
      return "Frage";
    case "success_story":
      return "Erfolgsstory";
    default:
      return "Beitrag";
  }
}

interface Post {
  id: number;
  content: string;
  type: "post" | "question" | "success_story";
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  author: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    subscriptionTier: string;
  };
}

export function CommunityFeed() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: () => fetchApi<Post[]>("/api/posts?limit=20"),
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: number; isLiked: boolean }) => {
      if (isLiked) {
        return postApi(`/api/posts/${postId}/unlike`, { userId: currentUser?.id });
      } else {
        return postApi(`/api/posts/${postId}/like`, { userId: currentUser?.id });
      }
    },
    onSuccess: (_, { postId, isLiked }) => {
      // Force a complete refresh from server to get correct data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post-like", postId, currentUser?.id] });
      
      // IMPORTANT: Invalidate user stats to update sidebar like counter
      queryClient.invalidateQueries({ queryKey: ["user-stats", currentUser?.id] });
      
      console.log(`Like/Unlike success for post ${postId}, was liked: ${isLiked}`);
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      return postApi(`/api/posts/${postId}/delete`, { userId: currentUser?.id });
    },
    onSuccess: () => {
      toast({
        title: "Beitrag gelöscht",
        description: "Der Beitrag wurde erfolgreich gelöscht.",
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      return postApi(`/api/posts/${postId}/comments`, {
        content,
        authorId: currentUser?.id,
      });
    },
    onSuccess: (_, { postId }) => {
      // Invalidate both posts and comments queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      
      toast({
        title: "Kommentar gesendet",
        description: "Dein Kommentar wurde erfolgreich hinzugefügt.",
      });
    },
  });

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "question":
        return <HelpCircle className="w-4 h-4 text-blue-500" />;
      case "success_story":
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "question":
        return "Frage";
      case "success_story":
        return "Erfolgsgeschichte";
      default:
        return "Beitrag";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Fehler beim Laden der Beiträge</p>
        </CardContent>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="space-y-3">
            <p className="text-lg font-medium">Noch keine Beiträge</p>
            <p className="text-muted-foreground">
              Sei der erste, der einen Beitrag in der Community veröffentlicht!
            </p>
            {currentUser && (
              <Button className="mt-4">
                Ersten Beitrag erstellen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          currentUser={currentUser}
          onLike={(postId, isLiked) => likeMutation.mutate({ postId, isLiked })}
          onDelete={(postId) => deleteMutation.mutate(postId)}
          onComment={(postId, content) => commentMutation.mutate({ postId, content })}
        />
      ))}
    </div>
  );
}

// PostCard component with all interactions
function PostCard({ 
  post, 
  currentUser, 
  onLike, 
  onDelete, 
  onComment 
}: {
  post: Post;
  currentUser: any;
  onLike: (postId: number, isLiked: boolean) => void;
  onDelete: (postId: number) => void;
  onComment: (postId: number, content: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const { toast } = useToast();

  // Check if user has liked this post
  const { data: likeStatus } = useQuery({
    queryKey: ["post-like", post.id, currentUser?.id],
    queryFn: () => fetchApi(`/api/posts/${post.id}/like/${currentUser?.id}`),
    enabled: !!currentUser,
  });

  // Update isLiked state when likeStatus changes
  useEffect(() => {
    if (likeStatus?.isLiked !== undefined) {
      console.log(`Setting like status for post ${post.id}:`, likeStatus.isLiked);
      setIsLiked(likeStatus.isLiked);
    }
  }, [likeStatus]);

  // Get comments for this post
  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["post-comments", post.id],
    queryFn: () => fetchApi(`/api/posts/${post.id}/comments`),
    enabled: showComments,
  });

  const handleLike = () => {
    if (!currentUser) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um Beiträge zu liken.",
        variant: "destructive",
      });
      return;
    }
    console.log(`Handling like for post ${post.id}, current isLiked:`, isLiked);
    onLike(post.id, isLiked);
  };

  const handleComment = () => {
    if (!currentUser) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Du musst angemeldet sein, um zu kommentieren.",
        variant: "destructive",
      });
      return;
    }
    if (commentText.trim()) {
      onComment(post.id, commentText.trim());
      setCommentText("");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Möchtest du diesen Beitrag wirklich löschen?")) {
      onDelete(post.id);
    }
  };

  const isAuthor = currentUser?.id === post.author.id;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center">
              {post.author.avatarUrl ? (
                <img 
                  src={post.author.avatarUrl} 
                  alt={post.author.displayName || post.author.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-semibold text-sm">
                  {(post.author.displayName || post.author.username).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm">
                  {post.author.displayName || post.author.username}
                </p>
                {post.author.subscriptionTier === 'premium' && (
                  <Badge variant="default" className="text-xs px-1.5 py-0.5">
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { 
                  addSuffix: true, 
                  locale: de 
                })}
              </p>
            </div>
          </div>
          
          {/* Post Type and Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {getPostTypeIcon(post.type)}
              <span className="text-xs text-muted-foreground">
                {getPostTypeLabel(post.type)}
              </span>
            </div>
            
            {/* Edit/Delete Menu for Author */}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Post Content */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          
          {/* Post Image */}
          {post.imageUrl && (
            <div className="rounded-md overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt="Post attachment"
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}
          
          {/* Post Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-muted-foreground ${isLiked ? 'text-red-500' : ''}`}
                onClick={handleLike}
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {post.likes}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground"
                onClick={() => {
                  setShowComments(!showComments);
                  if (!showComments) {
                    // Force refetch comments when opening comment section
                    refetchComments();
                  }
                }}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Kommentare
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {post.type === "question" && "💭 Hilf mit einer Antwort"}
              {post.type === "success_story" && "🎉 Gratuliere zum Erfolg"}
              {post.type === "post" && "💬 Teile deine Gedanken"}
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <CommentSection postId={post.id} />
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beitrag bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Bearbeite deinen Beitrag..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Implement edit functionality
                  setIsEditDialogOpen(false);
                }}
              >
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}