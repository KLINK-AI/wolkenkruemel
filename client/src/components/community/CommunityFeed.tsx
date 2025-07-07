import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { MessageCircle, Heart, Trophy, HelpCircle, FileText } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/api";

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
  
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: () => fetchApi<Post[]>("/api/posts?limit=20"),
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
        <Card key={post.id} className="hover:shadow-md transition-shadow">
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
              
              {/* Post Type */}
              <div className="flex items-center space-x-1">
                {getPostTypeIcon(post.type)}
                <span className="text-xs text-muted-foreground">
                  {getPostTypeLabel(post.type)}
                </span>
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
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments}
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {post.type === "question" && "💭 Hilf mit einer Antwort"}
                  {post.type === "success_story" && "🎉 Gratuliere zum Erfolg"}
                  {post.type === "post" && "💬 Teile deine Gedanken"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}