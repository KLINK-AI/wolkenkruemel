import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchApi, postApi } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

interface SuggestedUsersProps {
  currentUserId: number;
}

export default function SuggestedUsers({ currentUserId }: SuggestedUsersProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: users, isLoading } = useQuery({
    queryKey: ["suggested-users", currentUserId],
    queryFn: () => fetchApi(`/api/suggested-users?userId=${currentUserId}`),
  });

  const followMutation = useMutation({
    mutationFn: async (followingId: number) => {
      await postApi(`/api/users/${followingId}/follow`, {
        followerId: currentUserId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Nutzer gefolgt",
        description: "Du folgst diesem Nutzer jetzt.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/suggested-users"] });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock data as fallback
  const mockUsers = [
    { 
      id: 2, 
      displayName: "David Wilson", 
      bio: "Professional Dog Trainer",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
    },
    { 
      id: 3, 
      displayName: "Sarah Johnson", 
      bio: "Golden Retriever Enthusiast",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"
    },
  ];

  const displayUsers = users || mockUsers;

  const handleFollow = (userId: number) => {
    followMutation.mutate(userId);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{t('community.suggested')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayUsers.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    className="w-10 h-10 rounded-full" 
                    src={user.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"}
                    alt="User Avatar" 
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.displayName || "Anonymer Nutzer"}</p>
                    <p className="text-xs text-muted-foreground">{user.bio || "Hundetraining Enthusiast"}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleFollow(user.id)}
                  disabled={followMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1 rounded-full"
                >
                  {followMutation.isPending ? t('community.following') : t('community.follow')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
