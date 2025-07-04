import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendingTopics() {
  const { data: tags, isLoading } = useQuery({
    queryKey: ["/api/trending-tags"],
    queryFn: async () => {
      const response = await fetch("/api/trending-tags");
      if (!response.ok) throw new Error("Failed to fetch trending tags");
      return response.json();
    },
  });

  // Mock data as fallback
  const mockTags = [
    { tag: "PuppyTraining", count: 124 },
    { tag: "LeashTraining", count: 89 },
    { tag: "GoldenRetriever", count: 76 },
    { tag: "SuccessStory", count: 65 },
  ];

  const displayTags = tags || mockTags;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {displayTags.map((item: any) => (
              <div key={item.tag} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">#{item.tag}</span>
                <span className="text-xs text-gray-500">{item.count} posts</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
