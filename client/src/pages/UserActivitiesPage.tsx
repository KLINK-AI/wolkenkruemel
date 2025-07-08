import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Trash2, Eye, Plus } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { LazyImage } from "@/components/ui/lazy-image";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import FirstActivityPrompt from "@/components/FirstActivityPrompt";
import type { Activity } from "@shared/schema";

export default function UserActivitiesPage() {
  const { currentUser } = useAuth();
  
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch('/api/activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  // Filter activities to show only user's own activities
  const userActivities = activities.filter(activity => activity.authorId === currentUser?.id);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Anfänger';
      case 'intermediate': return 'Fortgeschritten';
      case 'advanced': return 'Experte';
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Meine Aktivitäten</h1>
          <p className="text-muted-foreground">Verwalte deine erstellten Trainingsaktivitäten</p>
        </div>
        <Link href="/activities/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neue Aktivität
          </Button>
        </Link>
      </div>

      {userActivities.length === 0 ? (
        <FirstActivityPrompt />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userActivities.map((activity) => (
            <Card key={activity.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                      {activity.title}
                    </h3>
                    <Badge className={getDifficultyColor(activity.difficulty)}>
                      {getDifficultyText(activity.difficulty)}
                    </Badge>
                  </div>
                  {activity.images && activity.images.length > 0 && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <LazyImage
                        src={activity.images[0]}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                        fallbackSrc="/api/placeholder/400/300"
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration} Min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{activity.likes} Likes</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/activities/${activity.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Ansehen
                    </Button>
                  </Link>
                  <Link href={`/activities/${activity.id}/edit`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}