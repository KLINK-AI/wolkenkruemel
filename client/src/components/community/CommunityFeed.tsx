import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CreatePostCard from "./CreatePostCard";
import ActivityPost from "./ActivityPost";
import QAPost from "./QAPost";
import AccessGate from "./AccessGate";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityFeed() {
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["/api/posts", { limit, offset }],
    queryFn: async () => {
      const response = await fetch(`/api/posts?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading community feed. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePostCard />
      
      <AccessGate />
      
      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}
      
      {posts && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
        </div>
      )}
      
      {posts && posts.map((post: any) => (
        <div key={post.id}>
          {post.type === "question" ? (
            <QAPost post={post} />
          ) : (
            <ActivityPost post={post} />
          )}
        </div>
      ))}
      
      {posts && posts.length > 0 && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={loadMore}
            className="px-6 py-3"
          >
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
}
