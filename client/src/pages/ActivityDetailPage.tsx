import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Clock, User, Heart, Bookmark, Share2, Edit, Star } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/components/LanguageProvider";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const permissions = usePermissions(currentUser);
  const { toast } = useToast();

  const userId = currentUser?.id;

  const { data: activity, isLoading, error } = useQuery({
    queryKey: ["/api/activities", id],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${id}`);
      if (!response.ok) throw new Error("Failed to fetch activity");
      return response.json();
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/activity-progress", userId, id],
    queryFn: async () => {
      const response = await fetch(`/api/activity-progress/${userId}/${id}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to fetch progress");
      return response.json();
    },
    enabled: !!id && !!userId,
  });

  const { data: likeData } = useQuery({
    queryKey: ["/api/activities", id, "like", userId],
    queryFn: async () => {
      const response = await fetch(`/api/activities/${id}/like/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch like status");
      return response.json();
    },
    enabled: !!id && !!userId,
  });

  const isFavorite = progress?.favorite || false;
  const isLiked = likeData?.isLiked || false;

  const updateProgressMutation = useMutation({
    mutationFn: async (progressUpdate: { tried?: boolean; mastered?: boolean; favorite?: boolean }) => {
      if (!userId) throw new Error("User not authenticated");
      if (!id) throw new Error("Activity ID not found");
      const response = await apiRequest("POST", `/api/activity-progress/${userId}/${id}`, progressUpdate);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-progress", userId, id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-progress", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
    onError: (error) => {
      console.error("Failed to update progress:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern des Fortschritts. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (liked: boolean) => {
      if (!userId) throw new Error("User not authenticated");
      if (!id) throw new Error("Activity ID not found");
      
      const endpoint = liked ? `/api/activities/${id}/like` : `/api/activities/${id}/unlike`;
      const response = await apiRequest("POST", endpoint, { userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities", id, "like", userId] });
    },
    onError: (error) => {
      console.error("Failed to update like status:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern des Likes. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'Anfänger';
      case 'intermediate': return 'Fortgeschritten';
      case 'advanced': return 'Experte';
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Aktivität nicht gefunden</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Die angeforderte Aktivität konnte nicht geladen werden.</p>
          <Link href="/activities">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zu Aktivitäten
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/activities">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zu Aktivitäten
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{activity.title}</CardTitle>
                    <p className="text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {currentUser && activity.author && activity.author.id === currentUser.id && (
                      <Link href={`/activities/${id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Bearbeiten
                        </Button>
                      </Link>
                    )}
                    {permissions.canSeeProgress && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateProgressMutation.mutate({ favorite: !isFavorite });
                        }}
                        disabled={updateProgressMutation.isPending}
                      >
                        <Bookmark className={`w-4 h-4 mr-1 ${isFavorite ? 'fill-blue-500 text-blue-500' : ''}`} />
                        {isFavorite ? 'Favorit' : 'Als Favorit'}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (!userId) {
                          toast({
                            title: "Anmeldung erforderlich",
                            description: "Bitte melden Sie sich an, um Aktivitäten zu liken.",
                            variant: "destructive",
                          });
                          return;
                        }
                        likeMutation.mutate(!isLiked);
                      }}
                      disabled={likeMutation.isPending}
                      className={isLiked ? "text-red-500 border-red-500" : ""}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                      {activity.likes}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getDifficultyColor(activity.difficulty)}>
                    {getDifficultyText(activity.difficulty)}
                  </Badge>
                  {activity.duration && (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.duration} Min
                    </Badge>
                  )}
                  <Badge variant="outline">
                    <Star className="w-3 h-3 mr-1" />
                    {activity.completions} beherrschen das
                  </Badge>
                </div>

                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {activity.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {activity.images && activity.images.length > 0 && (
                  <div className="mb-6">
                    {activity.images.length === 1 ? (
                      <div className="flex justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <img 
                          src={activity.images[0]} 
                          alt={activity.title}
                          className="max-w-full max-h-96 object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activity.images.map((image: string, index: number) => (
                          <div key={index} className="flex justify-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <img 
                              src={image} 
                              alt={`${activity.title} - Bild ${index + 1}`}
                              className="max-w-full max-h-64 object-contain rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-foreground">
                    {activity.content}
                  </div>
                </div>

                {activity.videoUrl && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Video-Anleitung</h3>
                    <div className="aspect-video">
                      <iframe
                        src={activity.videoUrl}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Tracking Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Mein Fortschritt</CardTitle>
              </CardHeader>
              <CardContent>
                {permissions.canSeeProgress && permissions.canSaveFavorites ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="tried"
                        checked={progress?.tried || false}
                        onCheckedChange={(checked) => {
                          updateProgressMutation.mutate({ tried: !!checked });
                        }}
                        disabled={updateProgressMutation.isPending}
                      />
                      <label
                        htmlFor="tried"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Ich habe diese Aktivität ausprobiert
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="mastered"
                        checked={progress?.mastered || false}
                        onCheckedChange={(checked) => {
                          updateProgressMutation.mutate({ mastered: !!checked });
                        }}
                        disabled={updateProgressMutation.isPending}
                      />
                      <label
                        htmlFor="mastered"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Mein Hund beherrscht diese Übung
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="favorite"
                        checked={progress?.favorite || false}
                        onCheckedChange={(checked) => {
                          updateProgressMutation.mutate({ favorite: !!checked });
                        }}
                        disabled={updateProgressMutation.isPending}
                      />
                      <label
                        htmlFor="favorite"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Diese Aktivität ist ein Favorit unserer Routine
                      </label>
                    </div>

                    {updateProgressMutation.isPending && (
                      <div className="text-sm text-muted-foreground">
                        Fortschritt wird gespeichert...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="mb-2">
                      <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {permissions.needsEmailVerification 
                          ? "E-Mail bestätigen, um Fortschritt zu speichern"
                          : "Premium-Mitgliedschaft erforderlich für Fortschrittsverfolgung und Favoriten"
                        }
                      </p>
                    </div>
                    {permissions.needsPremiumUpgrade && (
                      <Link href="/premium">
                        <Button 
                          className="mt-3" 
                          variant="outline" 
                          size="sm"
                        >
                          Premium freischalten
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Erstellt von</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {activity.author?.avatarUrl ? (
                      <img 
                        className="w-12 h-12 rounded-full" 
                        src={activity.author.avatarUrl}
                        alt="Author Avatar" 
                      />
                    ) : (
                      <span className="text-lg">
                        {(activity.author?.displayName || activity.author?.username || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{activity.author?.displayName || activity.author?.username || "Unbekannter Autor"}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aufrufe</span>
                    <span className="font-semibold">{activity.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Likes</span>
                    <span className="font-semibold">{activity.likes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hunde beherrschen das</span>
                    <span className="font-semibold">{activity.completions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Erstellt</span>
                    <span className="font-semibold">
                      {new Date(activity.createdAt).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}